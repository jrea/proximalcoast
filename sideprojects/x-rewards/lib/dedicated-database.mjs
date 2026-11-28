import {hkdfSync} from 'node:crypto';
export function dedicatedTarget(dsn,expectedHost){
  const url=new URL(dsn);
  if(!['postgres:','postgresql:'].includes(url.protocol)||!expectedHost||url.hostname!==expectedHost||!url.hostname.endsWith('.thenile.dev')||url.port!=='5432'||url.pathname!=='/x_creator'||!url.username||!url.password||url.search||url.hash)throw Error('Unexpected dedicated database.');
  return url;
}
export function derivedVisitorKey(url){
  const password=decodeURIComponent(url.password);
  if(!/^[a-zA-Z0-9_-]{32,}$/.test(password))return null;
  return Buffer.from(hkdfSync('sha256',password,'proximalcoast-x-rewards','queue/visitor-rate-limit/v1',32));
}
