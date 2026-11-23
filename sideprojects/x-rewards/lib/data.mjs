import fs from 'node:fs/promises';
import pg from 'pg';
import {dedicatedTarget} from './dedicated-database.mjs';
import { parse } from 'csv-parse/sync';

export const columns=['creator_handle','payout_cycle','payout_usd','source_post_url','source_post_utc','source_post_views','creator_follower_snapshot','followers_observed_date','receipt_media_url','supporting_source_url','evidence_type'];
const day=/^\d{4}-\d{2}-\d{2}$/;
const handle=/^[A-Za-z0-9_]{1,15}$/;
const amount=/^\d+\.\d{2}$/;
const safeLink=(s)=>{try {return ['x.com','note.com','climbx.so','hashout.jp','xpaiming.com','teapawt.org'].includes(new URL(s).hostname) && new URL(s).protocol==='https:';} catch {return false;}};
const strictEnd=(start,end,cycle)=>Date.parse(end)-Date.parse(start)===13*86400000 && Date.parse(cycle)-Date.parse(end)===3*86400000;
const nullableCount=(v)=>v===''?null:Number(v);
export function decodePayouts(text){
  const records=parse(text,{bom:true,columns:true,skip_empty_lines:true});
  const keys=new Set();
  for(const r of records){
    const key=r.creator_handle.toLowerCase()+':'+r.payout_cycle;
    if(Object.keys(r).join(',')!==columns.join(',')||keys.has(key)||!handle.test(r.creator_handle)||!day.test(r.payout_cycle)||!amount.test(r.payout_usd)||Number(r.payout_usd)<=0||!/^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+(?:\/photo\/\d+)?$/.test(r.source_post_url)||['source_post_views','creator_follower_snapshot'].some(k=>r[k]&&!/^\d+$/.test(r[k]))||['receipt_media_url','supporting_source_url'].some(k=>r[k]&&!safeLink(r[k]))) throw Error('Invalid payout entry or duplicate creator and cycle');
    keys.add(key);
  }
  return records;
}
export function validateObservations(observations,payouts){
  const amounts=new Map(payouts.map(r=>[r.creator_handle.toLowerCase()+':'+r.payout_cycle,Number(r.payout_usd)]));
  const unique=new Set();
  for(const o of observations){
    const k=o.creator.toLowerCase()+':'+o.cycle;
    if(!handle.test(o.creator)||amounts.get(k)!==o.payoutUsd||!['verified','total','premium'].includes(o.metric)||!(o.count>0&&Number.isSafeInteger(o.count))||!['exact','rolling14','reported_cycle','approximate'].includes(o.kind)||!safeLink(o.source)||unique.has(k+':'+o.metric)||o.kind==='exact'&&(!day.test(o.start)||!day.test(o.end)||!strictEnd(o.start,o.end,o.cycle)||o.metric==='premium')||o.kind!=='exact'&&(o.start||o.end)) throw Error('Invalid, duplicate or unmatched impression observation');
    unique.add(k+':'+o.metric);
  }
  for(const o of observations.filter(x=>x.metric==='total')){
    const verified=observations.find(x=>x.metric==='verified'&&x.creator.toLowerCase()===o.creator.toLowerCase()&&x.cycle===o.cycle&&x.kind===o.kind);
    if(verified && verified.count>o.count)throw Error('Verified count exceeds total count');
  }
  return observations;
}
export async function loadSnapshot(){
  const [csv,raw,hist]=await Promise.all(['payouts.csv','observations.json','historical.json'].map(x=>fs.readFile(new URL('../data/'+x,import.meta.url),'utf8')));
  const payouts=decodePayouts(csv);
  const observations=validateObservations(JSON.parse(raw),payouts);
  return {payouts,observations,historical:JSON.parse(hist),dataSource:'snapshot'};
}
let pool;
export async function loadData(){
  const dsn=process.env.X_REWARDS_DATABASE_URL||process.env.X_REWARDS_QUEUE_DATABASE_URL;
  if(!dsn)return loadSnapshot();
  if(process.env.VERCEL||!process.env.X_REWARDS_DATABASE_URL)dedicatedTarget(dsn,process.env.X_REWARDS_NILE_HOST);
  if(!pool)pool=new pg.Pool({connectionString:dsn,ssl:{rejectUnauthorized:true},max:4,connectionTimeoutMillis:4000,statement_timeout:5000,query_timeout:6500});
  const client=await pool.connect();
  try {
    await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
    const {rows:payouts}=await client.query(`select creator_handle,payout_cycle::text,payout_usd::text,source_post_url,source_post_utc,coalesce(source_post_views::text,'') as source_post_views,coalesce(creator_follower_snapshot::text,'') as creator_follower_snapshot,coalesce(followers_observed_date::text,'') as followers_observed_date,receipt_media_url,supporting_source_url,evidence_type from x_rewards.payouts order by payout_cycle,lower(creator_handle)`);
    const {rows:observations}=await client.query(`select p.creator_handle creator,i.payout_cycle::text cycle,p.payout_usd::float8 as "payoutUsd", i.metric,i.impression_count::float8 count,i.analytics_start::text start,i.analytics_end::text end,i.observation_kind kind,i.source_url source from x_rewards.impression_observations i join x_rewards.payouts p using (creator_key,payout_cycle) order by i.payout_cycle,p.creator_key,i.metric`);
    const {rows:historical}=await client.query(`select creator_handle creator,label,payout_usd::float8 as "payoutUsd",metric,impression_count::float8 count,'historical' kind,source_url source from x_rewards.historical_context order by creator_handle`);
    validateObservations(observations,payouts);
    await client.query('COMMIT');
    return {payouts,observations,historical,dataSource:'database'};
  } catch(err) {await client.query('ROLLBACK').catch(()=>{});throw err;}
  finally{client.release();}
}
export const csvText=(rows)=>[columns.join(','),...rows.map(r=>columns.map(k=>{
  const s=String(r[k]??'');
  return /[",\n\r]/.test(s)?'"'+s.replaceAll('"','""')+'"':s;
}).join(','))].join('\r\n')+'\r\n';

export function sqlRows(rows){
  return rows.map(r=>[r.creator_handle.toLowerCase(),r.creator_handle,r.payout_cycle,r.payout_usd,r.source_post_url,r.source_post_utc,nullableCount(r.source_post_views),nullableCount(r.creator_follower_snapshot),r.followers_observed_date||null,r.receipt_media_url,r.supporting_source_url,r.evidence_type]);
}
