import {mkdir,chmod,writeFile,rename,readdir,rm,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir} from 'node:os';
import {randomBytes,createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import pg from 'pg';

const tables=['payouts','impression_observations','historical_context','submission_queue','submission_limits','ingestion_runs','ingestion_events','public_proofs'];
const dsn=process.env.X_REWARDS_BACKUP_DATABASE_URL;
if(!dsn)throw Error('Inject the backup credential securely first.');
const url=new URL(dsn), restore=process.argv[2]==='--verify-scratch';
const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
if(restore?(!local||!decodeURIComponent(url.pathname).startsWith('/x_rewards_restore')):(!url.hostname.endsWith('.thenile.dev')||url.hostname!==process.env.X_REWARDS_NILE_HOST||url.pathname!=='/x_creator'))throw Error('Use x_creator for a backup, or an empty loopback x_rewards_restore database for validation.');
const client=new pg.Client({connectionString:dsn,ssl:local?undefined:{rejectUnauthorized:true},connectionTimeoutMillis:6000,statement_timeout:15000});
try{
 await client.connect();
 const {rows:[r]}=await client.query('select current_database() db');
 if(!local&&![url.hostname.split('.')[0],'x_creator'].includes(r.db))throw Error('Unexpected database.');
 if(restore){
   const file=process.argv[3];
   if(!file)throw Error('Provide backup filename.');
   const {digest,payload}=JSON.parse(gunzipSync(await readFile(file)));
   if(createHash('sha256').update(JSON.stringify(payload)).digest('hex')!==digest||payload.schema!=='x_rewards'||Object.keys(payload.tables).some(t=>!tables.includes(t)))throw Error('Backup integrity check failed.');
   await client.query('BEGIN');
   const {rows:[existing]}=await client.query("select to_regnamespace('x_rewards') as present");
   if(existing.present)throw Error('Validation target already has x_rewards schema.');
   for(const sql of ['001_initial.sql','queue.sql','ingestion.sql','003_public_proofs.sql']){
    const source=await readFile(new URL('./'+sql,import.meta.url),'utf8').catch(err=>err.code==='ENOENT'?null:Promise.reject(err));
    if(source)await client.query(source);
   }
   for(const table of tables){
    const rows=payload.tables[table];if(!rows)continue;
    const insert=await client.query(`insert into x_rewards.${table} select * from jsonb_populate_recordset(NULL::x_rewards.${table},$1::jsonb)`,[JSON.stringify(rows)]);
    if(insert.rowCount!==rows.length)throw Error('Restored row count does not match manifest.');
   }
   await client.query('ROLLBACK');
   console.log('Backup restored and validated in scratch transaction; rolled back.');
 }else{
   await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
   const {rows}=await client.query("select table_name from information_schema.tables where table_schema='x_rewards' and table_type='BASE TABLE'");
   const found=new Set(rows.map(r=>r.table_name));if(!found.has('payouts')||!found.has('submission_queue'))throw Error('Expected payouts and queue in x_rewards.');
   const data={};
   for(const table of tables)if(found.has(table)){
     const {rows}=await client.query(`select to_jsonb(x) row from x_rewards.${table} x`);
     data[table]=rows.map(r=>r.row);
   }
   await client.query('COMMIT');
   const date=new Date().toISOString();
   const payload={format:1,schema:'x_rewards',exportedAt:date,tables:data};
   const digest=createHash('sha256').update(JSON.stringify(payload)).digest('hex');
   const blob=gzipSync(JSON.stringify({digest,payload}));
   const dir=process.env.X_REWARDS_BACKUP_DIR||join(homedir(),'.local/share/x-rewards/backups');
   process.umask(0o077);await mkdir(dir,{recursive:true,mode:0o700});await chmod(dir,0o700);
   const file=join(dir,'x_rewards-'+date.slice(0,10)+'.json.gz'), temp=file+'.'+randomBytes(6).toString('hex')+'.tmp';
   try{await writeFile(temp,blob,{flag:'wx',mode:0o600});await rename(temp,file);}finally{await rm(temp,{force:true});}
   const cutoff=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
   for(const e of await readdir(dir,{withFileTypes:true})){
    const m=/^x_rewards-(\d{4}-\d{2}-\d{2})\.json\.gz$/.exec(e.name);if(e.isFile()&&m&&m[1]<cutoff)await rm(join(dir,e.name));
   }
   console.log('Saved dedicated database backup: '+Object.entries(data).map(([k,v])=>k+'='+v.length).join(', '));
 }
}catch(e){await client.query('ROLLBACK').catch(()=>{});console.error(e.code?'Backup operation failed: '+e.code:e.message);process.exitCode=1;}
finally{await client.end().catch(()=>{});}
