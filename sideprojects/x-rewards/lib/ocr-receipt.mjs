const cents=(v)=>Number.isSafeInteger(v)&&v>0;
function date(s){return typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;}
export function assertOcrReceipt(receipt,cycle,amountCents){
 if(!receipt||receipt.reviewedOcrLine!==true||receipt.currency!=='USD'||!cents(amountCents)||!date(cycle)||receipt.cycle!==cycle||receipt.amountCents!==amountCents||!['ocr-only','mixed'].includes(receipt.scope))throw Error('Confirm the dated USD Original Content Rewards line, not a balance, transfer, or multi-program total.');
 if(receipt.scope==='ocr-only'){
  if(receipt.receiptTotalCents!=null&&receipt.receiptTotalCents!==amountCents||receipt.excluded!=null&&(!Array.isArray(receipt.excluded)||receipt.excluded.length))throw Error('Receipt contains non-OCR values; use an itemized mixed receipt review.');
  return true;
 }
 if(!cents(receipt.receiptTotalCents)||receipt.receiptTotalCents<=amountCents||!Array.isArray(receipt.excluded)||!receipt.excluded.length||receipt.excluded.some(x=>!x||!date(x.cycle)||!cents(x.amountCents)||typeof x.program!=='string'||!x.program.trim()||/\bocr\b|original (?:content|creator) rewards/i.test(x.program))||receipt.excluded.reduce((s,x)=>s+x.amountCents,amountCents)!==receipt.receiptTotalCents)throw Error('Mixed receipt does not reconcile to the explicitly attributed OCR line and excluded program amounts; hold for review.');
 return true;
}
