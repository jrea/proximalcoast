import {readFile} from 'node:fs/promises';
import {ImageResponse} from '@vercel/og';
import {allPublicProofs} from '../lib/leaderboard.mjs';
import {loadData} from '../lib/data.mjs';
import {verifiedRateLabel} from '../public/public-proof.mjs';
import {benchmarkObservations,rangeFor} from '../public/metrics.mjs';
// Official white X logo path from the About X brand toolkit (x-logo.zip).
const logo={type:'svg',props:{width:45,height:46,viewBox:'0 0 1200 1227',children:{type:'path',props:{d:'M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z',fill:'#fff'}}}};
const fontFile=new URL('../data/fonts/inter-latin-900-normal.woff',import.meta.url);
const el=(type,style,children)=>({type,props:{style,children}});
export default async function handler(req,res){
  if(!['GET','HEAD'].includes(req.method)){res.setHeader('Allow','GET, HEAD');res.status(405).end();return;}
  try{
    const data=await loadData();
    const {rows}=await allPublicProofs(data),{observations,payouts}=data;
    const range=rangeFor(benchmarkObservations(observations,payouts,rows),'verified');
    if(!range){res.setHeader('Cache-Control','no-store');res.status(503).end();return;}
    const value=verifiedRateLabel(range);
    const font=await readFile(fontFile);
    const art=el('div',{display:'flex',position:'relative',overflow:'hidden',width:'100%',height:'100%',flexDirection:'column',justifyContent:'center',padding:'62px 72px',background:'#040608',color:'#f2f8ff'},[
      el('div',{display:'flex',position:'absolute',width:950,height:770,right:-225,top:-52,backgroundImage:'radial-gradient(ellipse at center, #0a3457 0%, #081b2b 43%, #040608 72%)'},''),
      ...[590,470,350].map(size=>el('div',{position:'absolute',display:'flex',width:size,height:size,top:316-size/2,right:215-size/2,border:'1px solid #16314a',borderRadius:'50%'},'')),
      el('div',{display:'flex',alignItems:'center',gap:19,marginBottom:27},[logo,el('span',{fontSize:43,fontFamily:'Inter',fontWeight:900},'X actually pays.')]),
      el('span',{fontFamily:'Inter',fontSize:value.length>14?110:154,fontWeight:900,color:'#55bdff',letterSpacing:-8,whiteSpace:'nowrap',lineHeight:1.04},value),
      el('span',{fontSize:40,color:'#eff7ff',marginTop:26},'per 1,000 verified impressions')
    ]);
    const img=new ImageResponse(art,{width:1200,height:630,fonts:[{name:'Inter',data:font,weight:900,style:'normal'}]});
    const buffer=Buffer.from(await img.arrayBuffer());
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','public, s-maxage=900, stale-while-revalidate=3600');
    res.status(200).end(req.method==='HEAD'?undefined:buffer);
  }catch{res.setHeader('Cache-Control','no-store');res.status(503).end();}
}
