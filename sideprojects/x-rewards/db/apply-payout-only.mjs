import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {loadSnapshot,sqlRows} from '../lib/data.mjs';
import {assertOcrReceipt} from '../lib/ocr-receipt.mjs';
import {dedicatedTarget} from '../lib/dedicated-database.mjs';
const [creator,cycle]=process.argv.slice(2);
const breakdowns=JSON.parse(await readFile(new URL('../data/receipt-breakdowns.json',import.meta.url),'utf8'));
const matches=breakdowns.filter(r=>r.creator===creator&&r.cycle===cycle);
if(matches.length!==1)throw Error('Select one canonical audited payout-only record by exact creator and cycle.');
const proof=matches[0];
const {payouts,observations}=await loadSnapshot();
const row=payouts.find(r=>r.creator_handle===creator&&r.payout_cycle===cycle);
assertOcrReceipt(proof,cycle,Math.round(Number(row?.payout_usd)*100));
if(row.receipt_media_url!==proof.payoutProof||row.source_post_url!==proof.creatorContext||observations.some(r=>r.creator.toLowerCase()===creator&&r.cycle===cycle))throw Error('Canonical payout-only audit and ledger do not agree.');
const tuple=sqlRows([row])[0];
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL,target=dedicatedTarget(dsn,process.env.X_REWARDS_NILE_HOST);
const client=new pg.Client({connectionString:dsn,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:5000,statement_timeout:10000});
try{
 await client.connect();
 const {rows:[db]}=await client.query('select current_database() db');
 if(![target.hostname.split('.')[0],'x_creator'].includes(db.db))throw Error('Unexpected database identity.');
 await client.query('begin');
 const result=await client.query('insert into x_rewards.payouts values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict do nothing',tuple);
 const {rowCount}=await client.query("select 1 from x_rewards.payouts where creator_key=$1 and creator_handle=$2 and payout_cycle=$3 and payout_usd=$4 and source_post_url=$5 and source_post_utc=$6 and source_post_views is not distinct from $7 and creator_follower_snapshot is not distinct from $8 and followers_observed_date is not distinct from $9 and receipt_media_url=$10 and supporting_source_url=$11 and evidence_type=$12",[...tuple]);
 if(rowCount!==1)throw Error('Existing row has conflicting facts; no changes committed.');
 await client.query('commit');
 console.log(result.rowCount?'Wrote one audited payout-only row.':'Exact payout-only row already exists.');
}catch(e){await client.query('rollback').catch(()=>{});console.error(e.code?'Payout write error: '+e.code:e.message);process.exitCode=1;}finally{await client.end();}
