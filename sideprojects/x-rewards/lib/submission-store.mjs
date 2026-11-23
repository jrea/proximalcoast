import {createHmac} from 'node:crypto';
import {isIP} from 'node:net';
import pg from 'pg';
let pool;
export function submissionStore(){
  const dsn=process.env.X_REWARDS_QUEUE_DATABASE_URL, secret=process.env.X_REWARDS_QUEUE_RATE_SECRET;
  if(!dsn||!secret||secret.length<32)return null;
  if(dsn===process.env.X_REWARDS_ADMIN_DATABASE_URL)throw Error('The intake requires a separate restricted credential.');
  const url=new URL(dsn);
  const local=['127.0.0.1','localhost','[::1]'].includes(url.hostname);
  if(!local&&(!url.hostname.endsWith('.thenile.dev')||url.hostname!==process.env.X_REWARDS_NILE_HOST||decodeURIComponent(url.pathname)!=='/x_creator'))throw Error('Unexpected intake database.');
  if(local&&process.env.VERCEL)throw Error('Local queue targets are test-only.');
  pool??=new pg.Pool({connectionString:dsn,ssl:local?undefined:{rejectUnauthorized:true},max:2,connectionTimeoutMillis:3200,statement_timeout:4000});
  return {
    async stats(){
      const {rows:[row]}=await pool.query('select * from x_rewards.submission_queue_stats()');
      return {accepting:true,pendingCount:row.pending_count,lastProcessedAt:row.last_processed_at?.toISOString()??null};
    },
    async enqueue({payout,impressions},ip){
      if(typeof ip!=='string'||!isIP(ip.trim()))return 'unavailable';
      const day=new Date().toISOString().slice(0,10);
      const visitor=createHmac('sha256',secret).update(day+'|'+ip.trim()).digest('hex');
      const {rows:[row]}=await pool.query('select x_rewards.enqueue_submission($1,$2,$3) as outcome',[payout.statusId,impressions.statusId,visitor]);
      return row.outcome;
    }
  };
}
