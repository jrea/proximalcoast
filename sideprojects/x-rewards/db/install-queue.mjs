import {readFile} from 'node:fs/promises';
import pg from 'pg';
const dsn=process.env.X_REWARDS_ADMIN_DATABASE_URL;
if(!dsn)throw Error('Inject operator connection for the dedicated DB first.');
const url=new URL(dsn);
if(!url.hostname.endsWith('.thenile.dev')||url.hostname!==process.env.X_REWARDS_NILE_HOST||decodeURIComponent(url.pathname)!=='/x_creator')throw Error('Expected dedicated x_creator Nile database only.');
const client=new pg.Client({connectionString:dsn,ssl:{rejectUnauthorized:true},connectionTimeoutMillis:6000,statement_timeout:12000});
try{
 await client.connect();
 const {rows:[target]}=await client.query('select current_database() db');
 if(![url.hostname.split('.')[0],'x_creator'].includes(target.db))throw Error('Connected to wrong DB.');
 await client.query('BEGIN');
 await client.query(await readFile(new URL('./queue.sql',import.meta.url),'utf8'));
 const {rows:[stats]}=await client.query('select * from x_rewards.submission_queue_stats()');
 await client.query('COMMIT');
 console.log('Installed private submission queue for dedicated x_creator DB. Pending:',stats.pending_count);
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code?'Queue install failed: '+e.code:e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
