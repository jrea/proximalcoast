import { csvText, loadData } from '../lib/data.mjs';
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  try{const data=await loadData();res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="x-original-content-rewards-payouts.csv"');res.status(200);res.end(req.method==='HEAD'?undefined:csvText(data.payouts));}
  catch{res.setHeader('Cache-Control','no-store');res.status(503).json({error:'Payout data is temporarily unavailable.'});}
}
