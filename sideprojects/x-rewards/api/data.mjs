import { loadData } from '../lib/data.mjs';
import {allPublicProofs} from '../lib/leaderboard.mjs';
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  try{const {approvals,...data}=await loadData();const proofs=await allPublicProofs({...data,approvals});res.setHeader('Cache-Control','public, s-maxage=120, stale-while-revalidate=300');res.status(200);if(req.method==='HEAD'){res.end();return;}res.json({...data,proofs});}
  catch{res.setHeader('Cache-Control','no-store');res.status(503).json({error:'Payout data is temporarily unavailable.'});}
}
