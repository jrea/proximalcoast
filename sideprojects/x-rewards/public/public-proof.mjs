const dollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
export function verifiedRateLabel(range){
  return !range?null:dollars.format(range.min)+'–'+dollars.format(range.max);
}
