import {leaderboard,csvLeaderboard} from '../lib/leaderboard.mjs';
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  const url=new URL(req.url,'http://localhost');
  const cycle=url.searchParams.get('cycle')||'';
  const csv=url.pathname.endsWith('.csv')||url.searchParams.get('format')==='csv';
  if(cycle&&!/^\d{4}-\d{2}-\d{2}$/.test(cycle)){res.status(400).json({error:'Use YYYY-MM-DD for cycle.'});return;}
  try{
    const result=await leaderboard(cycle);
    if(cycle&&!result.cycles.includes(cycle)){res.status(404).json({error:'Unknown payout cycle.'});return;}
    res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');res.status(200);
    if(csv){res.setHeader('Content-Type','text/csv; charset=utf-8');res.setHeader('Content-Disposition','attachment; filename="x-rewards-leaderboard.csv"');}
    else res.setHeader('Content-Type','application/json; charset=utf-8');
    if(req.method==='HEAD'){res.end();return;}
    if(csv)res.end(csvLeaderboard(result.rows));else res.json(result);
  }catch{res.setHeader('Cache-Control','no-store');res.status(503).json({error:'Leaderboard temporarily unavailable.'});}
}
