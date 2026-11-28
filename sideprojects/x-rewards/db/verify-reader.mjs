import pg from 'pg';
const dsn=process.env.X_REWARDS_DATABASE_URL;
if(!dsn)throw Error('Provide X_REWARDS_DATABASE_URL in the environment.');
const url=new URL(dsn);
const db=new pg.Client({connectionString:dsn,ssl:url.hostname.endsWith('.thenile.dev')?{rejectUnauthorized:true}:undefined,connectionTimeoutMillis:5000,statement_timeout:8000});
try{
 await db.connect();
 const {rows:[r]}=await db.query(`select current_user reader,
   has_database_privilege(current_database(),'CREATE') can_create_db_schema,
   exists(select 1 from pg_namespace n where n.nspname!~'^(pg_|information_schema$)' and has_schema_privilege(n.oid,'CREATE')) can_create_in_schema,
   exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where c.relkind in ('r','p','v','m','f') and n.nspname!~'^(pg_|information_schema$)' and n.nspname<>'x_rewards' and
    (has_table_privilege(c.oid,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     or has_any_column_privilege(c.oid,'SELECT,INSERT,UPDATE,REFERENCES'))) other_table_access,
   exists(select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
    where c.relkind in ('r','p','v','m','f') and n.nspname='x_rewards' and
    (has_table_privilege(c.oid,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
     or has_any_column_privilege(c.oid,'INSERT,UPDATE,REFERENCES'))) rewards_write_access`);
 if(r.reader!==decodeURIComponent(url.username)||Object.keys(r).some(k=>k!=='reader'&&r[k])) {
  const denied=Object.keys(r).filter(k=>k!=='reader'&&r[k]);
  throw Error('Reader is not isolated. Extra privilege checks failed: '+(denied.join(', ')||'identity'));
 }
 const {rows:[n]}=await db.query('select (select count(*) from x_rewards.payouts)::int payouts,(select count(*) from x_rewards.impression_observations)::int observations,(select count(*) from x_rewards.historical_context)::int historical');
 if(!n.payouts||!n.observations)throw Error('Reader cannot see the populated rewards tables.');
 console.log('Verified isolated reader:',n);
}catch(e){console.error(e.code?'Reader verification failed: '+e.code:e.message);process.exitCode=1;}
finally{await db.end().catch(()=>{});}
