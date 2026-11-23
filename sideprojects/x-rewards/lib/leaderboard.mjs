import {readFile} from 'node:fs/promises';
import {loadSnapshot} from './data.mjs';

const key=(creator,cycle)=>creator.toLowerCase()+':'+cycle;
const media=(url,creator)=>{
  const match=/^https:\/\/x\.com\/([A-Za-z0-9_]{1,15})\/status\/([0-9]{10,25})\/photo\/([1-4])$/.exec(url);
  return match&&match[1].toLowerCase()===creator.toLowerCase();
};
export function buildLeaderboard(approvals,observations,cycle=''){
  const exact=new Map(observations.filter(r=>r.kind==='exact'&&r.metric==='verified').map(r=>[key(r.creator,r.cycle),r]));
  const seen=new Set(), qualified=[];
  for(const a of approvals){
    const id=key(a.creator,a.cycle), row=exact.get(id);
    if(!row||seen.has(id)||a.decision!=='approved'||a.payoutProof===a.impressionsProof||
       !media(a.payoutProof,a.creator)||!media(a.impressionsProof,a.creator)||
       a.verifiedImpressions!==row.count||a.payoutUsd!==row.payoutUsd||
       a.start!==row.start||a.end!==row.end) throw Error('Invalid or duplicate approved leaderboard proof.');
    seen.add(id);
    qualified.push({creator:row.creator,cycle:row.cycle,payoutUsd:row.payoutUsd,verifiedImpressions:row.count,start:row.start,end:row.end,payoutProof:a.payoutProof,impressionsProof:a.impressionsProof});
  }
  qualified.sort((a,b)=>b.cycle.localeCompare(a.cycle)||b.payoutUsd-a.payoutUsd||a.creator.localeCompare(b.creator));
  const cycles=[...new Set(observations.filter(r=>r.kind==='exact'&&r.metric==='verified').map(r=>r.cycle))].sort().reverse();
  const chosen=cycle||null;
  const selected=qualified.filter(row=>!chosen||row.cycle===chosen).sort((a,b)=>b.payoutUsd-a.payoutUsd||b.cycle.localeCompare(a.cycle)||a.creator.localeCompare(b.creator));
  const rows=selected.slice(0,chosen?undefined:5).map((row,index,all)=>({...row,rank:all.findIndex(v=>v.payoutUsd===row.payoutUsd)+1}));
  return {cycle:chosen,cycles,rows,lastReviewedOn:'2026-11-23'};
}
let saved;
export async function leaderboard(cycle){
  saved??=Promise.all([readFile(new URL('../data/leaderboard.json',import.meta.url),'utf8'),loadSnapshot()]);
  const [raw,{observations}]=await saved;
  return buildLeaderboard(JSON.parse(raw),observations,cycle);
}
export const csvLeaderboard=rows=>['rank,creator,payout_cycle,payout_usd,verified_impressions,window_start,window_end,payout_proof,impressions_proof',
 ...rows.map(r=>[r.rank,r.creator,r.cycle,r.payoutUsd.toFixed(2),r.verifiedImpressions,r.start,r.end,r.payoutProof,r.impressionsProof].join(','))].join('\r\n')+'\r\n';
