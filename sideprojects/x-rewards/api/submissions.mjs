import {validateSubmission,queueStatus} from '../lib/submissions.mjs';
import {submissionStore} from '../lib/submission-store.mjs';
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store');
  if(req.method==='GET'){
    try{const store=submissionStore();res.status(200).json(store?await store.stats():queueStatus);}
    catch{res.status(200).json(queueStatus);}
    return;
  }
  if(req.method!=='POST'){res.setHeader('Allow','GET, POST');res.status(405).end();return;}
  const size=Number(req.headers['content-length']||0);
  if(size>1000){res.status(413).end();return;}
  let submission;
  try{
    let body=req.body;
    if(body===undefined){
      const chunks=[];let bytes=0;
      for await(const chunk of req){bytes+=Buffer.byteLength(chunk);if(bytes>1000){res.status(413).end();return;}chunks.push(chunk);}
      body=Buffer.concat(chunks).toString('utf8');
    }
    if(typeof body==='string')body=JSON.parse(body);
    submission=validateSubmission(body);
  }catch{res.status(400).json({error:'Send payoutUrl and impressionsUrl as public X post URLs, with optIn: true.'});return;}
  try{
    const store=submissionStore();
    if(store){
      const ip=process.env.VERCEL?req.headers['x-forwarded-for']:req.socket?.remoteAddress;
      const outcome=await store.enqueue(submission,ip);
      if(outcome==='accepted'){res.status(202).json({status:'queued'});return;}
      if(outcome==='rate-limited'){res.setHeader('Retry-After','86400');res.status(429).json({error:'Submission limit reached. Try tomorrow.'});return;}
    }
  }catch{ /* Fail closed: never log user inputs or connection information. */ }
  res.status(503).json({error:'Submission queue is not open. No submission was confirmed.'});
}
