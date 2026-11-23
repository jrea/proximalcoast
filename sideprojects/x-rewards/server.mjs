import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import data from './api/data.mjs';
import payouts from './api/payouts.mjs';
import leaderboard from './api/leaderboard.mjs';
import submissions from './api/submissions.mjs';
import og from './api/og.mjs';
const assets={'/proximal-coast-icon-v3.svg':['proximal-coast-icon-v3.svg','image/svg+xml'],'/proximal-coast-mark.svg':['proximal-coast-mark.svg','image/svg+xml'],'/favicon.svg':['favicon.svg','image/svg+xml'],'/public-proof.mjs':['public-proof.mjs','text/javascript'],'/submit.css':['submit.css','text/css; charset=utf-8'],'/submit.mjs':['submit.mjs','text/javascript'],'/receipts':['receipts.html','text/html; charset=utf-8'],'/leaderboard':['index.html','text/html; charset=utf-8'],'/':['index.html','text/html; charset=utf-8'],'/metrics.mjs':['metrics.mjs','text/javascript'],'/app.mjs':['app.mjs','text/javascript'],'/methodology.txt':['methodology.txt','text/plain; charset=utf-8']};
createServer(async(req,res)=>{
  res.status=(code)=>(res.statusCode=code,res);
  res.json=(obj)=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(obj));};
  const path=new URL(req.url,'http://localhost').pathname;
  if(path==='/og.png'||path==='/api/og')return og(req,res);
  if(path==='/api/submissions')return submissions(req,res);
  if(path==='/api/leaderboard'||path==='/leaderboard.csv')return leaderboard(req,res);
  if(path==='/api/data')return data(req,res);
  if(path==='/payouts.csv'||path==='/api/payouts')return payouts(req,res);
  if(!assets[path])return res.status(404).end();
  if(!['GET','HEAD'].includes(req.method))return res.status(405).end();
  try{const [file,type]=assets[path];const bytes=await readFile(new URL('./public/'+file,import.meta.url));res.setHeader('Content-Type',type);res.end(req.method==='HEAD'?undefined:bytes);}
  catch{res.status(500).end();}
}).listen(Number(process.env.PORT||4312),'127.0.0.1');
