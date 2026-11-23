import {topProof} from './public-proof.mjs';
import { dollarsPerThousand,rangeFor,estimate,joinPayoutProofs,benchmarkObservations,formatCalculatorInput } from './metrics.mjs';
const $=(id)=>document.getElementById(id);
const integer=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const dollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const fmtDate=(s)=>new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(s+'T00:00:00Z'));
const rate=(n)=>n<0.01?'$'+n.toFixed(4):dollars.format(n);
function tag(name,text,style){
  const e=document.createElement(name);
  if(text!==undefined)e.textContent=String(text);
  if(style)e.className=style;
  return e;
}
function link(text,url){
  const a=tag('a',text);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a;
}
const periods={rolling14:'Prior 14 days, exact dates unstated',reported_cycle:'Creator’s period; exact dates unstated',approximate:'Approximate; exact dates unstated'};
const labels={verified:'Verified',total:'Total',premium:'Premium (creator wording)'};
function compareRows(data,strict){
  const frag=document.createDocumentFragment();
  const map=new Map();
  const joined=new Map((data.proofs?.rows||[]).map(r=>[r.creator.toLowerCase()+':'+r.cycle,r]));
  const benchmarkKeys=new Set(data.benchmark.map(o=>o.creator.toLowerCase()+':'+o.cycle+':'+o.metric));
  for(const row of data.observations.filter(o=>benchmarkKeys.has(o.creator.toLowerCase()+':'+o.cycle+':'+o.metric)===strict)){
    const k=row.creator.toLowerCase()+':'+row.cycle;
    if(!map.has(k))map.set(k,{...row,views:{},links:{}});
    const r=map.get(k);
    r.views[row.metric]=row;
    r.links[row.metric]=row.source;
  }
  if(!strict){
    for(const h of data.historical) map.set(h.creator+':earlier',{...h,views:{[h.metric]:h},links:{[h.metric]:h.source}});
    const denche=data.payouts.find(x=>x.creator_handle.toLowerCase()==='denche2005'&&x.payout_cycle==='2026-11-20');
    if(denche)map.set('denche:second',{creator:denche.creator_handle,cycle:denche.payout_cycle,payoutUsd:Number(denche.payout_usd),kind:'no_count',views:{},links:{none:denche.source_post_url}});
  }
  for(const d of [...map.values()].sort((a,b)=>(b.cycle??'').localeCompare(a.cycle??'')||a.creator.localeCompare(b.creator))){
    const tr=tag('tr'), who=tag('th');who.scope='row';
    const reviewed=joined.get(d.creator.toLowerCase()+':'+d.cycle);
    who.append(link('@'+d.creator,strict&&reviewed?reviewed.payoutProof:Object.values(d.links)[0]));
    if(strict&&reviewed){const verified=tag('span',' ✓ Verified');verified.title='Payout and verified impressions screenshots match this cycle';who.append(verified);}
    who.append(tag('span',d.cycle?fmtDate(d.cycle)+' payout':d.label,'sub'));
    const duration=d.kind==='exact'?fmtDate(d.start)+' – '+fmtDate(d.end):periods[d.kind]??(d.kind==='historical'?'Creator retrospective':'No matching analytics disclosed');
    tr.append(who,tag('td',duration,'window'),tag('td',dollars.format(d.payoutUsd),'numeric'));
    for(const metric of ['verified','total',...(strict?[]:['premium'])]){
      const x=d.views[metric], td=tag('td',undefined,'numeric');
      if(x)td.append(link((x.kind==='approximate'?'~':'')+integer.format(x.count),strict&&reviewed?reviewed.impressionsProof:x.source),tag('span',rate(dollarsPerThousand(x))+' / 1K','sub'));
      else td.append(tag('span','—','missing'));
      tr.append(td);
    }
    frag.append(tr);
  }
  return frag;
}
function paintPayouts(data){
  const q=$('payout-search'), by=$('payout-cycle'), sort=$('payout-sort'), verified=$('payout-verified');
  const out=$('payout-status'), tbody=$('payout-rows'), prev=$('payout-prev'), next=$('payout-next');
  const ledger=joinPayoutProofs(data.payouts,data.proofs?.rows||[]);
  const size=5;
  let page=0;
  const cycles=[...new Set(ledger.map(r=>r.payout_cycle))].sort().reverse();
  for(const cycle of cycles){const op=tag('option',fmtDate(cycle));op.value=cycle;by.append(op);}
  const parameters=new URLSearchParams(location.search);
  if(cycles.includes(parameters.get('cycle')))by.value=parameters.get('cycle');
  if(parameters.get('verified')==='1')verified.checked=true;
  if(data.proofs?.lastReviewedOn)$('review-status').textContent='Last reviewed '+fmtDate(data.proofs.lastReviewedOn)+'.';
  function badge(proof){
    const panel=tag('details',undefined,'proof-badge'), badge=tag('summary','✓');
    badge.setAttribute('aria-label','Verified. Show payout and impressions screenshots.');
    badge.title='Verified: payout and impressions screenshots match this cycle';
    const evidence=tag('div',undefined,'proof-links');
    evidence.append(tag('span',integer.format(proof.verifiedImpressions)+' verified impressions'),link('Payout screenshot',proof.payoutProof),link('Impressions screenshot',proof.impressionsProof));
    panel.append(badge,evidence);return panel;
  }
  function update(){
    const key=q.value.trim().toLowerCase().replace(/^@/,'');
    const rows=ledger.filter(r=>r.creator_handle.toLowerCase().includes(key)&&(!by.value||r.payout_cycle===by.value)&&(!verified.checked||r.proof));
    const direction=sort.value==='high'?-1:sort.value==='low'?1:0;
    rows.sort((a,b)=>direction*(Number(a.payout_usd)-Number(b.payout_usd))||b.payout_cycle.localeCompare(a.payout_cycle)||a.creator_handle.localeCompare(b.creator_handle));
    const start=page*size,end=Math.min(start+size,rows.length),frag=document.createDocumentFragment();
    for(const r of rows.slice(start,end)){
      const tr=tag('tr'), source=tag('td'), th=tag('th');th.scope='row';
      const handle=tag('div',undefined,'who');handle.append(tag('span','@'+r.creator_handle));
      if(r.proof)handle.append(badge(r.proof));
      th.append(handle);source.append(link('X post',r.source_post_url));
      source.firstChild.setAttribute('aria-label','X disclosure by @'+r.creator_handle+' · '+fmtDate(r.payout_cycle));
      tr.append(th,tag('td',dollars.format(r.payout_usd),'numeric'),tag('td',fmtDate(r.payout_cycle)),source);
      frag.append(tr);
    }
    tbody.replaceChildren(frag);
    out.textContent=rows.length?'Showing '+(start+1)+'–'+end+' of '+integer.format(rows.length)+' payouts.':'No payouts match these filters.';
    $('payout-wrap').hidden=!rows.length;
    prev.disabled=page===0;next.disabled=end>=rows.length;
  }
  function syncFilters(){
    const url=new URL(location.href);
    if(by.value)url.searchParams.set('cycle',by.value);else url.searchParams.delete('cycle');
    if(verified.checked)url.searchParams.set('verified','1');else url.searchParams.delete('verified');
    history.replaceState(null,'',url);
  }
  for(const x of [q,by,sort,verified])x.addEventListener(x===q?'input':'change',()=>{page=0;if(x===by||x===verified)syncFilters();update();});
  prev.addEventListener('click',()=>{if(page>0){page--;update();}});
  next.addEventListener('click',()=>{if(!next.disabled){page++;update();}});
  update();
  fetch('/api/submissions',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(state=>{
    if(state&&Number.isInteger(state.pendingCount)){
      const processed=state.lastProcessedAt?fmtDate(state.lastProcessedAt.slice(0,10)):'no batches processed yet';
      $('queue-status').textContent=integer.format(state.pendingCount)+' pending · '+processed+'.';
    }
  }).catch(()=>{});
}
function renderTotals(data){
  const amounts=data.payouts.map(r=>Number(r.payout_usd)).sort((a,b)=>a-b);
  if(!amounts.length) return;
  const sum=amounts.reduce((a,b)=>a+b,0), midpoint=Math.floor(amounts.length/2);
  const med=amounts.length%2?amounts[midpoint]:(amounts[midpoint-1]+amounts[midpoint])/2;
  const cut=Math.ceil(amounts.length*.1), share=amounts.slice(-cut).reduce((a,b)=>a+b,0)/sum;
  $('total-payouts').textContent=integer.format(amounts.length);
  $('total-creators').textContent=integer.format(new Set(data.payouts.map(r=>r.creator_handle.toLowerCase())).size);
  $('total-cycles').textContent=integer.format(new Set(data.payouts.map(r=>r.payout_cycle)).size);
  $('sample-median').textContent=dollars.format(med);
  $('sample-mean').textContent=dollars.format(sum/amounts.length);
  $('sample-share').textContent=(share*100).toFixed(1)+'%';
  $('sample-note').textContent='Top 10% uses the '+integer.format(cut)+' largest payouts in this sample.';
}
const wholeDollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
function calculate(data){
  const form=$('calc'), value=$('calc-value'), result=$('estimate-output');
  const benchmark=rangeFor(data.benchmark,'verified');
  $('hero-evidence').textContent=benchmark
    ? benchmark.sampleCount+' payout windows · '+benchmark.creatorCount+' creators · X Analytics verified impressions.'
    : 'No screenshot-verified payout windows are available.';
  let lastValue=value.value;
  value.addEventListener('input',()=>{
    const before=value.value, at=value.selectionStart??before.length;
    const offset=before.slice(0,at).replace(/[\s,\$]/g,'').length;
    const formatted=formatCalculatorInput(before);
    if(formatted===null){value.value=lastValue;return;}
    if(formatted!==before){
      value.value=formatted;let caret=0,seen=0;
      while(caret<formatted.length&&seen<offset){if(formatted[caret]!==',')seen++;caret++;}
      value.setSelectionRange(caret,caret);
    }
    lastValue=formatted;
    result.replaceChildren();result.hidden=true;
  });
  form.addEventListener('submit',(e)=>{
    e.preventDefault();
    result.hidden=false;
    if(!benchmark){result.replaceChildren(tag('p','No screenshot-verified payout windows are available.','estimate-invalid'));return;}
    try{
      const formatted=formatCalculatorInput(value.value);
      if(formatted===null)throw Error('Enter a whole number of verified impressions.');
      value.value=formatted;lastValue=formatted;
      const n=Number(formatted.replaceAll(',','')), guess=estimate(benchmark,n,'payout');
      const cash=guess.low<10?dollars:wholeDollars;
      result.replaceChildren(tag('span','Estimated payout at '+integer.format(n)+' verified impressions','result-line'),
        tag('strong',cash.format(guess.low)+'–'+cash.format(guess.high),'estimate-number'),
        tag('span','Median estimate: '+cash.format(guess.mid)+' · Observed '+rate(benchmark.min)+'–'+rate(benchmark.max)+' per 1,000','result-line'));
    }catch(err){result.replaceChildren(tag('p',err.message,'estimate-invalid'));}
  });
}
async function load(){
  try {
    const r=await fetch('/api/data');if(!r.ok)throw Error();
    const data=await r.json();
    data.benchmark=benchmarkObservations(data.observations,data.payouts,data.proofs?.rows||[]);
    $('data-mode').textContent=data.dataSource==='database'?'Live database':'Archive snapshot · live database not connected';
    if($('top-proof-value')){
      const best=topProof(data.proofs?.rows||[]);
      if(best){$('top-proof-value').textContent=dollars.format(best.payoutUsd);$('top-proof-value').hidden=false;$('top-proof-note').hidden=false;}
    }
    if($('total-payouts'))renderTotals(data);
    if($('same-window'))$('same-window').append(compareRows(data,true));
    if($('context-window'))$('context-window').append(compareRows(data,false));
    if($('payout-rows'))paintPayouts(data);
    if($('calc'))calculate(data);
    $('dashboard').hidden=false;
  } catch {
    $('data-mode').textContent='Saved snapshot · calculator temporarily unavailable';
    if($('calc'))$('calc').hidden=true;
  }
}
load();
