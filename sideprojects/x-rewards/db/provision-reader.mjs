import fs from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import pg from 'pg';
const admin=process.env.X_REWARDS_ADMIN_DATABASE_URL;
const path=process.env.X_REWARDS_READER_FILE;
if(!admin||!path)throw Error('Set admin URL and a new protected reader output path.');
const target=new URL(admin);
const remote=target.hostname.endsWith('.thenile.dev');
if(remote && decodeURIComponent(target.pathname)!=='/meatspace')throw Error('Only the approved meatspace database is supported for a remote reader.');
const client=new pg.Client({connectionString:admin,ssl:remote?{rejectUnauthorized:true}:undefined,connectionTimeoutMillis:6000,statement_timeout:8000});
const name='x_rewards_reader_'+randomBytes(5).toString('hex');
const password=randomBytes(24).toString('hex');
const reader=new URL(admin);reader.username=name;reader.password=password;
let created=false;
try {
 await client.connect();
 const {rows:[r]}=await client.query('select current_database() db');
 const expected=remote?target.hostname.split('.')[0]:decodeURIComponent(target.pathname.slice(1));
 if(r.db!==expected&&(!remote||r.db!=='meatspace'))throw Error('Unexpected database target.');
 await client.query('BEGIN');
 await client.query(`CREATE ROLE "${name}" LOGIN NOINHERIT PASSWORD '${password}'`);
 await client.query(`GRANT USAGE ON SCHEMA x_rewards TO "${name}"`);
 await client.query(`GRANT SELECT ON x_rewards.payouts, x_rewards.impression_observations, x_rewards.historical_context TO "${name}"`);
 await client.query('COMMIT');created=true;
 const args=[new URL('./verify-reader.mjs',import.meta.url).pathname];
 const {X_REWARDS_ADMIN_DATABASE_URL:unused,...env}=process.env;
 const result=spawnSync(process.execPath,args,{stdio:'inherit',env:{...env,X_REWARDS_DATABASE_URL:reader.href}});
 if(result.status!==0)throw Error('Narrow reader failed authentication or isolation; cannot set runtime credentials.');
 await fs.writeFile(path,reader.href,{encoding:'utf8',flags:'wx',mode:0o600});
 console.log('Wrote verified reader connection to the protected output path.');
}catch(e){
 await client.query('ROLLBACK').catch(()=>{});
 if(created){
  try{
   await client.query('BEGIN');
   await client.query(`REVOKE SELECT ON x_rewards.payouts, x_rewards.impression_observations, x_rewards.historical_context FROM "${name}"`);
   await client.query(`REVOKE USAGE ON SCHEMA x_rewards FROM "${name}"`);
   await client.query(`DROP ROLE "${name}"`);
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK').catch(()=>{});console.error('Reader cleanup failed:',error.code||'unexpected error');}
 }
 console.error(e.code?'Reader provisioning failed: '+e.code+' '+e.message.split(password).join('[redacted]'):e.message);process.exitCode=1;
}finally{await client.end().catch(()=>{});}
