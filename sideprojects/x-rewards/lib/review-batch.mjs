import {approvedProof,storeApprovedProof} from './approved-proof.mjs';
import {normalizeStatus} from './submissions.mjs';
// Call only inside a transaction. Caller owns COMMIT/ROLLBACK.
export async function applyReviewBatch(client,batch){
   if(typeof batch.reviewer!=='string'||!/^[A-Za-z0-9_-]{1,60}$/.test(batch.reviewer)||!Array.isArray(batch.decisions)||!batch.decisions.length||batch.decisions.length>100)throw Error('Invalid review batch.');
   await client.query('LOCK TABLE x_rewards.public_proofs IN SHARE ROW EXCLUSIVE MODE');
   for(const d of batch.decisions){
     if(!['approved','rejected'].includes(d.status))throw Error('Invalid review decision.');
     const p=normalizeStatus(d.payoutUrl).statusId,i=normalizeStatus(d.impressionsUrl).statusId;
     const result=await client.query("update x_rewards.submission_queue set status=$1,processed_at=now(),reviewer=$2 where payout_status=$3 and impressions_status=$4 and status='pending'",[d.status,batch.reviewer,p,i]);
     if(result.rowCount!==1)throw Error('A reviewed entry is not pending; batch rolled back.');
     if(d.status==='approved')await storeApprovedProof(client,approvedProof(d.proof,p,i));
   }
}
