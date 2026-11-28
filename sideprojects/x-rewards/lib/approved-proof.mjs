import {normalizeStatus} from './submissions.mjs';
const days=86400000;
function iso(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function approvedProof(proof,p,i){
 const {creator,cycle,start,end,amountCents,impressions,payoutProof,impressionsProof,metric,screenshotsReviewed}=proof??{};
 if(!/^[a-z0-9_]{1,15}$/i.test(creator??'')||!['verified'].includes(metric)||screenshotsReviewed!==true||![cycle,start,end].every(iso)||Date.parse(end)-Date.parse(start)!==13*days||Date.parse(cycle)-Date.parse(end)!==3*days||!Number.isSafeInteger(amountCents)||amountCents<1||amountCents>999999999999||!Number.isSafeInteger(impressions)||impressions<1)throw Error('Approval requires exact Verified screenshot values, dates and a review attestation.');
 const photo=(s,id)=>{
  const m=typeof s==='string'&&/^https:\/\/x\.com\/([a-z0-9_]{1,15})\/status\/([1-9][0-9]{9,24})\/photo\/([1-4])$/i.exec(s);
  if(!m||m[1].toLowerCase()!==creator.toLowerCase()||m[2]!==id||normalizeStatus(s).statusId!==id)throw Error('Each screenshot must be from its corresponding submitted X post and creator.');
  return 'https://x.com/'+creator.toLowerCase()+'/status/'+m[2]+'/photo/'+m[3];
 };
 const payout=photo(payoutProof,p),analytics=photo(impressionsProof,i);
 if(payout===analytics)throw Error('Approval requires two distinct screenshots.');
 return {creator,cycle,start,end,amountCents,impressions,payout,analytics};
}
export async function storeApprovedProof(client,a,publishedOn=null){
 const k=a.creator.toLowerCase();
 const usd=(a.amountCents/100).toFixed(2);
 await client.query("insert into x_rewards.payouts(creator_key,creator_handle,payout_cycle,payout_usd,source_post_url,source_post_utc,receipt_media_url,supporting_source_url,evidence_type) values($1,$2,$3,$4,$5,'',$6,$7,'reviewed_submission') on conflict do nothing",[k,a.creator,a.cycle,usd,a.payout.replace(/\/photo\/[1-4]$/,''),a.payout,a.analytics]);
 const matched=await client.query("select 1 from x_rewards.payouts where creator_key=$1 and payout_cycle=$2 and payout_usd=$3",[k,a.cycle,usd]);
 if(matched.rowCount!==1)throw Error('Approval conflicts with an existing payout; batch rolled back.');
 await client.query("insert into x_rewards.impression_observations values($1,$2,'verified',$3,$4,$5,'exact',$6) on conflict do nothing",[k,a.cycle,a.impressions,a.start,a.end,a.analytics]);
 const total=await client.query("select 1 from x_rewards.impression_observations where creator_key=$1 and payout_cycle=$2 and metric='total' and observation_kind='exact' and impression_count<$3",[k,a.cycle,a.impressions]);
 if(total.rowCount)throw Error('Verified impressions exceed existing exact-period total; batch rolled back.');
 const observations=await client.query("select 1 from x_rewards.impression_observations where creator_key=$1 and payout_cycle=$2 and metric='verified' and impression_count=$3 and analytics_start=$4 and analytics_end=$5 and observation_kind='exact'",[k,a.cycle,a.impressions,a.start,a.end]);
 if(observations.rowCount!==1)throw Error('Approval conflicts with existing impressions; batch rolled back.');
 await client.query('lock table x_rewards.public_proofs in share row exclusive mode');
 const duplicate=await client.query('select 1 from x_rewards.public_proofs where not (creator_key=$1 and payout_cycle=$2) and (lower(impressions_proof) in ($3,$4) or lower(payout_proof)=$4)',[k,a.cycle,a.payout,a.analytics]);
 if(duplicate.rowCount)throw Error('Screenshot already used for a different proof; batch rolled back.');
 await client.query('insert into x_rewards.public_proofs(creator_key,payout_cycle,payout_proof,impressions_proof,published_on) values($1,$2,$3,$4,coalesce($5::date,current_date)) on conflict do nothing',[k,a.cycle,a.payout,a.analytics,publishedOn]);
 const proof=await client.query('select 1 from x_rewards.public_proofs where creator_key=$1 and payout_cycle=$2 and lower(payout_proof)=$3 and lower(impressions_proof)=$4',[k,a.cycle,a.payout,a.analytics]);
 if(proof.rowCount!==1)throw Error('Approval conflicts with already published proof; batch rolled back.');
}
