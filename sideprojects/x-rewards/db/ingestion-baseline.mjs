import {allPublicProofs} from '../lib/leaderboard.mjs';
const {rows}=await allPublicProofs();
const instant='2026-11-23T22:53:00Z';
const batch={id:'2026-11-23-published-proof-baseline',reviewer:'visual-proof-audit',startedAt:instant,finishedAt:instant,
 events:rows.map(r=>({id:r.creator.toLowerCase()+'-'+r.cycle,creator:r.creator,cycle:r.cycle,
  disposition:'approved',payoutUrl:r.payoutProof,impressionsUrl:r.impressionsProof,metric:'verified',
  amountCents:Math.round(r.payoutUsd*100),impressions:r.verifiedImpressions,start:r.start,end:r.end}))};
console.log(JSON.stringify(batch,null,2));
