const metrics=new Set(['verified','total']);
export const dollarsPerThousand=(row)=>row.payoutUsd/row.count*1000;
export function rangeFor(observations,metric,handle=''){
  if(!metrics.has(metric)) throw Error('Choose one of the supported impression metrics.');
  const eligible=observations.filter(o=>o.kind==='exact'&&o.metric===metric);
  const creator=handle.trim().replace(/^@/,'').toLowerCase();
  if(creator&&!/^[a-z0-9_]{1,15}$/.test(creator))throw Error('Enter a valid X handle.');
  const matches=creator?eligible.filter(o=>o.creator.toLowerCase()===creator):[];
  const relevant=new Set(matches.map(o=>o.cycle)).size>=2?matches:eligible;
  if(!relevant.length)return null;
  const rates=relevant.map(dollarsPerThousand).sort((a,b)=>a-b);
  const mid=Math.floor(rates.length/2);
  const median=rates.length%2?rates[mid]:(rates[mid-1]+rates[mid])/2;
  return {
    min:rates[0],median,max:rates.at(-1),sampleCount:rates.length,
    creatorCount:new Set(relevant.map(o=>o.creator.toLowerCase())).size,
    creatorSpecific:relevant===matches,creatorObservations:matches.length,
    start:relevant.map(o=>o.start).sort()[0],end:relevant.map(o=>o.end).sort().at(-1)
  };
}
export function estimate(range,value,direction){
  if(!range||!(value>0&&Number.isFinite(value)&&value<=1e12))throw Error('Enter a positive value up to 1 trillion.');
  if(direction==='payout')return {low:value*range.min/1000,mid:value*range.median/1000,high:value*range.max/1000};
  if(direction==='impressions')return {low:value/range.max*1000,mid:value/range.median*1000,high:value/range.min*1000};
  throw Error('Choose a calculation direction.');
}

const disclosureKey=(creator,cycle)=>creator.toLowerCase()+':'+cycle;
export function joinPayoutProofs(payouts,proofs){
  const evidence=new Map(proofs.map(proof=>[disclosureKey(proof.creator,proof.cycle),proof]));
  return payouts.map(row=>{
    const proof=evidence.get(disclosureKey(row.creator_handle,row.payout_cycle));
    return {...row, proof:proof?.payoutUsd===Number(row.payout_usd)?proof:null};
  });
}

export function benchmarkObservations(observations,payouts,proofs){
  const eligible=joinPayoutProofs(payouts,proofs).filter(r=>r.proof);
  const index=new Map(eligible.map(r=>[disclosureKey(r.creator_handle,r.payout_cycle),r.proof]));
  return observations.filter(o=>{
    const p=index.get(disclosureKey(o.creator,o.cycle));
    return p&&o.kind==='exact'&&o.metric==='verified'&&o.count===p.verifiedImpressions&&o.start===p.start&&o.end===p.end&&o.payoutUsd===p.payoutUsd;
  });
}
export function formatCalculatorInput(text,decimal=false){
  const clean=text.replace(/[\s,\$]/g,'');
  if(!/^(?:\d{0,13})(?:\.\d{0,2})?$/.test(clean)||(!decimal&&clean.includes('.')))return null;
  const [integer,cents]=clean.split('.');
  return integer.replace(/\B(?=(\d{3})+(?!\d))/g,',')+(cents===undefined?'':'.'+cents);
}
