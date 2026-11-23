export function topProof(rows){
  return rows.reduce((best,row)=>Number.isFinite(row.payoutUsd)&&row.payoutUsd>0&&(!best||row.payoutUsd>best.payoutUsd)?row:best,null);
}
