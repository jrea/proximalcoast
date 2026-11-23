import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import pg from 'pg';
import {normalizeStatus} from '../lib/submissions.mjs';
const arg=process.argv[2];
if(!arg)throw Error('Provide a local private batch JSON file.');
const batch=JSON.parse(await readFile(arg,'utf8'));
const token=/^[a-z0-9_-]{1,100}$/i;
const date=/^\d{4}-\d{2}-\d{2}$/;
const iso=(v)=>typeof v==='string'&&date.test(v)&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v;
const exactScreenshot=(url,creator)=>new RegExp('^https://x[.]com/'+creator+'/status/[1-9][0-9]{9,24}/photo/[1-4]$','i').test(url);
const exactSpan=(cycle,start,end)=>Date.parse(end)-Date.parse(start)===13*86400000&&Date.parse(cycle)-Date.parse(end)===3*86400000;
const validInt=(v)=>Number.isSafeInteger(v)&&v>0;
if(!token.test(batch.id)||typeof batch.id!=='string'||!token.test(batch.reviewer)||typeof batch.reviewer!=='string'||!Number.isFinite(Date.parse(batch.startedAt))||!Number.isFinite(Date.parse(batch.finishedAt))||Date.parse(batch.finishedAt)<Date.parse(batch.startedAt)||!Array.isArray(batch.events)||batch.events.length>500)throw Error('Invalid batch metadata.');
const seen=new Set();
const entries=batch.events.map(e=>{
  const creator=String(e.creator||'').toLowerCase();
  const rawReason=e.reason??null;
  const missing=e.missingFields??[];
  if(typeof e.id!=='string'||!token.test(e.id)||seen.has(e.id)||!['candidate','conflict','needs-proof','approved','rejected'].includes(e.disposition)||
    !/^[a-z0-9_]{1,15}$/.test(creator)||[e.cycle,e.start,e.end].some(d=>d!=null&&!iso(d))||(e.start&&e.end&&e.start>e.end)||
    (e.metric!=null&&!['verified','total','premium'].includes(e.metric))||[e.amountCents,e.impressions].some(n=>n!=null&&!validInt(n))||
    !Array.isArray(missing)||missing.some(f=>!['cycle','payout','payoutProof','impressions','impressionsProof','metric','window','creator'].includes(f))||
    (rawReason!=null&&(typeof rawReason!=='string'||rawReason.length>500))||
    (['needs-proof','conflict','rejected'].includes(e.disposition)&&!missing.length&&!rawReason))throw Error('Invalid ingestion event.');
  const proof=(url)=>url?{id:normalizeStatus(url).statusId,url}:null;
  const payout=proof(e.payoutUrl), view=proof(e.impressionsUrl);
  if(e.disposition==='approved'&&(!e.cycle||!e.start||!e.end||e.metric!=='verified'||!e.amountCents||!e.impressions||!payout||!view||payout.url.toLowerCase()===view.url.toLowerCase()||!exactScreenshot(payout.url,creator)||!exactScreenshot(view.url,creator)||!exactSpan(e.cycle,e.start,e.end)||missing.length))throw Error('Approved event is missing exact evidence.');
  seen.add(e.id);
  return {id:e.id,disposition:e.disposition,creator,cycle:e.cycle??null,payout,view,metric:e.metric??null,amount:e.amountCents??null,impressions:e.impressions??null,start:e.start??null,end:e.end??null,missing,reason:rawReason};
}).sort((a,b)=>a.id.localeCompare(b.id));
const digest=createHash('sha256').update(JSON.stringify([batch.reviewer,batch.startedAt,batch.finishedAt,entries])).digest('hex');
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL;
if(!dsn){console.log(`Validated ${entries.length} ingestion events (dry run, no database write).`);process.exit(0);}
const url=new URL(dsn);
const remote=url.hostname.endsWith('.thenile.dev');
if(remote?(decodeURIComponent(url.pathname)!=='/x_creator'||url.hostname!==process.env.X_REWARDS_NILE_HOST):!['localhost','127.0.0.1','[::1]'].includes(url.hostname))throw Error('Only approved x_creator or a loopback test DB is allowed.');
const client=new pg.Client({connectionString:dsn,ssl:remote?{rejectUnauthorized:true}:undefined,connectionTimeoutMillis:6000,statement_timeout:10000});
try{
 await client.connect();
 const {rows:[target]}=await client.query('select current_database() db');
 if(remote&&![url.hostname.split('.')[0],'x_creator'].includes(target.db))throw Error('Unexpected database.');
 await client.query('BEGIN');
 await client.query(await readFile(new URL('./ingestion.sql',import.meta.url),'utf8'));
 const saved=await client.query('insert into x_rewards.ingestion_runs values($1,$2,$3,$4,$5) on conflict (id) do nothing returning id',[batch.id,batch.startedAt,batch.finishedAt,batch.reviewer,digest]);
 if(!saved.rowCount){
  const {rows:[prior]}=await client.query('select digest from x_rewards.ingestion_runs where id=$1',[batch.id]);
  if(prior?.digest!==digest)throw Error('Run ID already exists with different evidence. Use a new run ID for append-only records.');
 }else for(const e of entries){
  await client.query('insert into x_rewards.ingestion_events values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)',
   [batch.id,e.id,e.disposition,e.creator,e.cycle,e.payout?.id,e.payout?.url,e.view?.id,e.view?.url,e.metric,e.amount,e.impressions,e.start,e.end,e.missing,e.reason,batch.reviewer]);
 }
 await client.query('COMMIT');
 console.log(saved.rowCount?`Recorded ${entries.length} private ingestion events.`:'Identical ingestion run already recorded.');
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code?'Ingestion database error: '+e.code:e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
