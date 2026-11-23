import {mkdir,chmod,readdir,rename,rm,stat} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {homedir} from 'node:os';
import {randomBytes} from 'node:crypto';

const dsn=process.env.X_REWARDS_BACKUP_DATABASE_URL;
if(!dsn)throw Error('Inject the backup connection securely before running.');
const url=new URL(dsn);
const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
if(!local&&(!url.hostname.endsWith('.thenile.dev')||url.hostname!==process.env.X_REWARDS_NILE_HOST||decodeURIComponent(url.pathname)!=='/x_creator'))throw Error('Unexpected backup database target.');
const dir=resolve(process.env.X_REWARDS_BACKUP_DIR||join(homedir(),'.local/share/x-rewards/backups'));
const bins=process.env.X_REWARDS_PG_BIN;
const tool=name=>bins?join(bins,name):name;
process.umask(0o077);
await mkdir(dir,{recursive:true,mode:0o700});
await chmod(dir,0o700);
const file=join(dir,'x_rewards-'+new Date().toISOString().slice(0,10)+'.dump');
const tmp=file+'.'+randomBytes(6).toString('hex')+'.tmp';
const {X_REWARDS_BACKUP_DATABASE_URL:_,...rest}=process.env;
const env={...rest,PGHOST:url.hostname.replace(/^\[|\]$/g,''),PGPORT:url.port||'5432',
  PGDATABASE:decodeURIComponent(url.pathname.slice(1)),PGUSER:decodeURIComponent(url.username||process.env.USER||''),
  PGPASSWORD:decodeURIComponent(url.password),PGSSLMODE:local?'disable':'verify-full',
  PGSSLROOTCERT:process.env.X_REWARDS_PG_SSLROOTCERT||'/etc/ssl/cert.pem',PGCONNECT_TIMEOUT:'8'};
delete env.PGSERVICE;delete env.PGSERVICEFILE;delete env.PGOPTIONS;
const exec=(name,args,withEnv=false)=>{
 const r=spawnSync(tool(name),args,{encoding:'utf8',env:withEnv?env:rest,timeout:180000,maxBuffer:2*1024*1024});
 if(r.status!==0)throw Error(name+' failed; no replacement backup was published.');
 return r.stdout;
};
try{
  exec('pg_dump',['--no-password','--format=custom','--schema=x_rewards','--no-owner','--no-acl','--file='+tmp],true);
  const toc=exec('pg_restore',['--list',tmp]);
  if(!/\bSCHEMA - x_rewards\b/.test(toc)||!/\bTABLE x_rewards\b/.test(toc))throw Error('Backup does not contain the x_rewards schema and tables.');
  await chmod(tmp,0o600);
  if((await stat(tmp)).size<100)throw Error('Backup is unexpectedly empty.');
  await rename(tmp,file);
  const cutoff=new Date(Date.now()-30*86400000).toISOString().slice(0,10);
  for(const e of await readdir(dir,{withFileTypes:true})){
    const match=/^x_rewards-(\d{4}-\d{2}-\d{2})\.dump$/.exec(e.name);
    if(e.isFile()&&match&&match[1]<cutoff)await rm(join(dir,e.name));
  }
  console.log('Verified x_rewards schema backup saved for '+new Date().toISOString().slice(0,10)+'.');
}finally{await rm(tmp,{force:true});}
