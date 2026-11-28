import pg from 'pg';
import {loadSnapshot} from '../lib/data.mjs';
import {dedicatedTarget} from '../lib/dedicated-database.mjs';
const mode=process.argv[2];
if(!['check','apply'].includes(mode))throw Error('Choose check or apply.');
const key='denche2005',cycle='2026-11-20',amount='2698.47';
const {payouts,observations}=await loadSnapshot();
const row=payouts.find(r=>r.creator_handle.toLowerCase()===key&&r.payout_cycle===cycle);
const observation=observations.find(r=>r.creator.toLowerCase()===key&&r.cycle===cycle);
if(!row||!observation||row.payout_usd!==amount||observation.kind!=='reported_cycle'||observation.metric!=='verified'||observation.count!==1563150||row.supporting_source_url!==observation.source||row.receipt_media_url!==observation.source+'/photo/1')throw Error('Seed does not match the audited disclosure.');
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL,target=dedicatedTarget(dsn,process.env.X_REWARDS_NILE_HOST);
const c=new pg.Client({connectionString:dsn,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:5000,statement_timeout:8000});
try {
 await c.connect();
 const {rows:[{db}]}=await c.query('select current_database() db');
 if(!['x_creator',target.hostname.split('.')[0]].includes(db))throw Error('Unexpected database identity.');
 await c.query('begin');
 const args=[key,cycle];
 const {rows:[existing]}=await c.query(`select payout_usd::text,source_post_url,receipt_media_url,supporting_source_url,evidence_type from x_rewards.payouts where creator_key=$1 and payout_cycle=$2 for update`,args);
 if(!existing||existing.payout_usd!==amount||existing.source_post_url!==row.source_post_url)throw Error('Existing payout differs; nothing changed.');
 const states=[['','','Post text'],[row.receipt_media_url,row.supporting_source_url,row.evidence_type]];
 if(!states.some(x=>x[0]===existing.receipt_media_url&&x[1]===existing.supporting_source_url&&x[2]===existing.evidence_type))throw Error('Existing payout evidence differs; nothing changed.');
 if((await c.query('select 1 from x_rewards.public_proofs where creator_key=$1 and payout_cycle=$2',args)).rowCount!==0)throw Error('Unexpected verified proof; preserve it for review.');
 if(existing.receipt_media_url!==row.receipt_media_url)await c.query(`update x_rewards.payouts set receipt_media_url=$3,supporting_source_url=$4,evidence_type=$5 where creator_key=$1 and payout_cycle=$2`,[...args,...states[1]]);
 await c.query(`insert into x_rewards.impression_observations (creator_key,payout_cycle,metric,impression_count,observation_kind,source_url) values($1,$2,'verified',$3,'reported_cycle',$4) on conflict do nothing`,[...args,observation.count,observation.source]);
 const {rowCount}=await c.query(`select 1 from x_rewards.impression_observations where creator_key=$1 and payout_cycle=$2 and metric='verified' and impression_count=$3 and observation_kind='reported_cycle' and source_url=$4 and analytics_start is null and analytics_end is null`,[...args,observation.count,observation.source]);
 if(rowCount!==1)throw Error('Existing observation differs; nothing changed.');
 await c.query(mode==='apply'?'commit':'rollback');
 console.log(mode==='apply'?'Denche payout evidence and reported impression count committed.':'Exact live changes validated and rolled back.');
} catch(e) {await c.query('rollback').catch(()=>{});console.error(e.code?'Database update failed: '+e.code:e.message);process.exitCode=1;}
finally {await c.end().catch(()=>{});}
