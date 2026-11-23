import {normalizeStatus,queueStatus} from '../lib/submissions.mjs';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){res.status(200).json(queueStatus);return;}
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');res.status(405).end();return;}
  const size=Number(req.headers['content-length']||0);
  if(size>1000){res.status(413).end();return;}
  try{
    let body=req.body;
    if(body===undefined){
      const chunks=[];let bytes=0;
      for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>1000){res.status(413).end();return;}chunks.push(chunk);}
      body=Buffer.concat(chunks).toString('utf8');
    }
    if(typeof body==='string')body=JSON.parse(body);
    if(!body||Object.keys(body).length!==1||!Object.hasOwn(body,'url'))throw Error();
    normalizeStatus(body.url);
  }catch{res.status(400).json({error:'Send one public X post URL as the url field.'});return;}
  res.status(503).json({error:'Submission queue is not open. Nothing was saved.'});
}
