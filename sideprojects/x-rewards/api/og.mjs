import {ImageResponse} from '@vercel/og';
import {allPublicProofs} from '../lib/leaderboard.mjs';
import {loadSnapshot} from '../lib/data.mjs';
import {benchmarkObservations,rangeFor} from '../public/metrics.mjs';
// Official white X logo path from the About X brand toolkit (x-logo.zip).
const logo={type:'svg',props:{width:45,height:46,viewBox:'0 0 1200 1227',children:{type:'path',props:{d:'M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z',fill:'#fff'}}}};
const money=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const el=(type,style,children)=>({type,props:{style,children}});
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  try{
    const [{rows},{observations,payouts}]=await Promise.all([allPublicProofs(),loadSnapshot()]);
    const range=rangeFor(benchmarkObservations(observations,payouts,rows),'verified');
    if(!range){res.setHeader('Cache-Control','no-store');res.status(503).end();return;}
    const value=money.format(range.min)+'–'+money.format(range.max);
    const art=el('div',{display:'flex',width:'100%',height:'100%',flexDirection:'column',justifyContent:'center',padding:'64px 80px',background:'#050505',color:'#f0f7ff'},[
      el('div',{display:'flex',alignItems:'center',gap:16,marginBottom:12},[logo,el('span',{fontSize:27,color:'#90d1ff',letterSpacing:3},'CREATOR REWARDS')]),
      el('span',{fontSize:66,fontWeight:800,marginBottom:3},'X actually pays.'),
      el('span',{fontSize:value.length>14?112:150,fontWeight:900,color:'#56baff',lineHeight:1.03},value),
      el('span',{fontSize:37,color:'#f0f7ff',marginTop:16},'per 1,000 verified impressions'),
      el('span',{fontSize:23,color:'#90d1ff',marginTop:22},'x-rewards.proximalcoast.com')
    ]);
    const img=new ImageResponse(art,{width:1200,height:630});
    const buffer=Buffer.from(await img.arrayBuffer());
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).end(req.method==='HEAD'?undefined:buffer);
  }catch{res.setHeader('Cache-Control','no-store');res.status(503).end();}
}
