import pg from 'pg';
import {applyReviewBatch} from '../lib/review-batch.mjs';
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL;
if(!dsn)throw Error('Inject dedicated operator connection before reviewing.');
const url=new URL(dsn);
if(!url.hostname.endsWith('.thenile.dev')||url.hostname!==process.env.X_REWARDS_NILE_HOST||decodeURIComponent(url.pathname)!=='/x_creator')throw Error('Expected dedicated x_creator only.');
const [mode='list',batchFile]=process.argv.slice(2);
const client=new pg.Client({connectionString:dsn,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:6000,statement_timeout:12000});
try{
 await client.connect();
 const {rows:[target]}=await client.query('select current_database() db');
 if(![url.hostname.split('.')[0],'x_creator'].includes(target.db))throw Error('Wrong database.');
 if(mode==='list'){
   const {rows}=await client.query("select payout_status,impressions_status,opt_in_at from x_rewards.submission_queue where status='pending' order by opt_in_at limit 100");
   console.log(JSON.stringify(rows.map(r=>({payoutUrl:'https://x.com/i/web/status/'+r.payout_status,impressionsUrl:'https://x.com/i/web/status/'+r.impressions_status,optedInAt:r.opt_in_at})),null,2));
 }else if(['check','apply'].includes(mode)&&batchFile){
   const {readFile}=await import('node:fs/promises');
   const batch=JSON.parse(await readFile(batchFile,'utf8'));
   await client.query('BEGIN');
   await applyReviewBatch(client,batch);
   if(mode==='check'){await client.query('ROLLBACK');console.log('Validated '+batch.decisions.length+' review decisions; database unchanged.');}
   else{await client.query('COMMIT');console.log('Processed '+batch.decisions.length+' private decisions. Only manually approved screenshot pairs were published.');}
 }else throw Error('Use list, check <private review JSON>, or apply <private review JSON>.');
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code?'Review error: '+e.code:e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
