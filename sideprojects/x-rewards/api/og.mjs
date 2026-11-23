import {ImageResponse} from '@vercel/og';
import {allPublicProofs} from '../lib/leaderboard.mjs';
import {loadSnapshot} from '../lib/data.mjs';
import {benchmarkObservations,rangeFor} from '../public/metrics.mjs';
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const el=(type,style,children)=>({type,props:{style,children}});
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  try{
    const [{rows},{observations,payouts}]=await Promise.all([allPublicProofs(),loadSnapshot()]);
    const range=rangeFor(benchmarkObservations(observations,payouts,rows),'verified');
    if(!range){res.setHeader('Cache-Control','no-store');res.status(503).end();return;}
    const value=range.max<1 ? Math.round(range.min*100)+'–'+Math.round(range.max*100)+'¢' : money.format(range.min)+'–'+money.format(range.max);
    const art=el('div',{display:'flex',width:'100%',height:'100%',flexDirection:'column',justifyContent:'center',padding:'64px 80px',background:'#07121d',color:'#f0f7ff'},[
      el('span',{fontSize:27,color:'#90d1ff',letterSpacing:3,marginBottom:14},'X CREATOR REWARDS'),
      el('span',{fontSize:66,fontWeight:800,marginBottom:3},'X actually pays.'),
      el('span',{fontSize:190,fontWeight:900,color:'#56baff',lineHeight:1.03},value),
      el('span',{fontSize:31,color:'#f0f7ff',marginTop:16},'per 1,000 verified impressions'),
      el('span',{fontSize:23,color:'#90d1ff',marginTop:22},'x-rewards.proximalcoast.com')
    ]);
    const img=new ImageResponse(art,{width:1200,height:630});
    const buffer=Buffer.from(await img.arrayBuffer());
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).end(req.method==='HEAD'?undefined:buffer);
  }catch{res.setHeader('Cache-Control','no-store');res.status(503).end();}
}
