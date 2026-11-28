import fs from 'node:fs/promises';
import pg from 'pg';
import { loadSnapshot,sqlRows } from '../lib/data.mjs';
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL;
if (!dsn) throw Error('Set X_REWARDS_ADMIN_DATABASE_URL in the process environment.');
const url=new URL(dsn);
const remote=url.hostname.endsWith('.thenile.dev');
const databaseName=decodeURIComponent(url.pathname.slice(1));
if (remote && databaseName!=='meatspace' && !(databaseName==='x_creator'&&url.hostname===process.env.X_REWARDS_NILE_HOST)) throw Error('Remote sync is limited to the approved meatspace database.');
const snapshot=await loadSnapshot();
const client=new pg.Client({connectionString:dsn,ssl:remote?{rejectUnauthorized:true}:undefined,connectionTimeoutMillis:6000,statement_timeout:10000});
const write=async(table,columns,rows,types,keyColumns)=>{
  const names=columns.join(',');
  const declaration=columns.map((c,i)=>c+' '+types[i]).join(',');
  const input='jsonb_to_recordset($1::jsonb) AS seed('+declaration+')';
  const keys=keyColumns.map(i=>'live.'+columns[i]+'=seed.'+columns[i]).join(' AND ');
  const equality=columns.map(c=>'live.'+c+' IS NOT DISTINCT FROM seed.'+c).join(' AND ');
  const payload=JSON.stringify(rows.map(r=>Object.fromEntries(columns.map((c,i)=>[c,r[i]]))));
  await client.query(`INSERT INTO x_rewards.${table} (${names}) SELECT ${names} FROM ${input} ON CONFLICT DO NOTHING`,[payload]);
  const {rows:[r]}=await client.query(`SELECT count(*)::int matches FROM ${input} JOIN x_rewards.${table} live ON ${keys} WHERE ${equality}`,[payload]);
  if(r.matches!==rows.length)throw Error('Seed conflicts with live '+table+' data; no rows changed.');
};
try{
  await client.connect();
  const {rows:[db]}=await client.query('SELECT current_database() db');
  const target=remote?url.hostname.split('.')[0]:decodeURIComponent(url.pathname.slice(1));
  if(db.db!==target && (!remote||db.db!==databaseName)) throw Error('Connected to an unexpected database.');
  await client.query('BEGIN');
  for (const name of ['001_initial.sql','002_rydawg_screenshot_count.sql']) {
    await client.query(await fs.readFile(new URL('./'+name,import.meta.url),'utf8'));
  }
  await write('payouts',
    ['creator_key','creator_handle','payout_cycle','payout_usd','source_post_url','source_post_utc','source_post_views','creator_follower_snapshot','followers_observed_date','receipt_media_url','supporting_source_url','evidence_type'],
    sqlRows(snapshot.payouts),['text','text','date','numeric','text','text','bigint','bigint','date','text','text','text'],[0,2]);
  await write('impression_observations',['creator_key','payout_cycle','metric','impression_count','analytics_start','analytics_end','observation_kind','source_url'],
    snapshot.observations.map(o=>[o.creator.toLowerCase(),o.cycle,o.metric,o.count,o.start??null,o.end??null,o.kind,o.source]),
    ['text','date','text','bigint','date','date','text','text'],[0,1,2]);
  await write('historical_context',['creator_handle','label','payout_usd','metric','impression_count','source_url'],
    snapshot.historical.map(o=>[o.creator,o.label,o.payoutUsd,o.metric,o.count,o.source]),['text','text','numeric','text','bigint','text'],[0,5,3]);
  await client.query('COMMIT');
  console.log(`Synced ${snapshot.payouts.length} payouts, ${snapshot.observations.length} impressions, ${snapshot.historical.length} historical reference into x_rewards.`);
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code ? 'Postgres sync failed: '+e.code : e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
