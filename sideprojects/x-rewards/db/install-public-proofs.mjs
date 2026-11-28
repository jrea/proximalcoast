import pg from 'pg';
import {readFile} from 'node:fs/promises';
import {dedicatedTarget} from '../lib/dedicated-database.mjs';
import {approvedProof,storeApprovedProof} from '../lib/approved-proof.mjs';
import {normalizeStatus} from '../lib/submissions.mjs';
const read=(name)=>readFile(new URL(name,import.meta.url),'utf8');
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL,url=dedicatedTarget(dsn,process.env.X_REWARDS_NILE_HOST);
const client=new pg.Client({connectionString:dsn,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:5000,statement_timeout:12000});
try{
 await client.connect();
 const {rows:[target]}=await client.query('select current_database() db');
 if(![url.hostname.split('.')[0],'x_creator'].includes(target.db))throw Error('Unexpected database.');
 await client.query('BEGIN');
 await client.query(await read('./003_public_proofs.sql'));
 const baseline=JSON.parse(await read('../data/leaderboard.json'));
 for(const o of baseline){
   const proof={...o,amountCents:Math.round(o.payoutUsd*100),impressions:o.verifiedImpressions,screenshotsReviewed:true,metric:'verified'};
   await storeApprovedProof(client,approvedProof(proof,normalizeStatus(o.payoutProof).statusId,normalizeStatus(o.impressionsProof).statusId),'2026-11-23');
 }
 await client.query('COMMIT');
 console.log('Migrated '+baseline.length+' verified baseline proofs without changing payout facts.');
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code?'Proof migration error: '+e.code:e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
