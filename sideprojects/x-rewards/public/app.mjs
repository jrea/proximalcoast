import { dollarsPerThousand,rangeFor,estimate } from './metrics.mjs';
const $=(id)=>document.getElementById(id);
const integer=new Intl.NumberFormat('en-US',{maximumFractionDigits:0});
const dollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const compact=new Intl.NumberFormat('en-US',{notation:'compact',maximumFractionDigits:2});
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
  for(const row of data.observations.filter(o=>(o.kind==='exact')===strict)){
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
    who.append(link('@'+d.creator,Object.values(d.links)[0]),tag('span',d.cycle?fmtDate(d.cycle)+' payout':d.label,'sub'));
    const duration=d.kind==='exact'?fmtDate(d.start)+' – '+fmtDate(d.end):periods[d.kind]??(d.kind==='historical'?'Creator retrospective':'No matching analytics disclosed');
    tr.append(who,tag('td',duration,'window'),tag('td',dollars.format(d.payoutUsd),'numeric'));
    for(const metric of ['verified','total',...(strict?[]:['premium'])]){
      const x=d.views[metric], td=tag('td',undefined,'numeric');
      if(x)td.append(link((x.kind==='approximate'?'~':'')+integer.format(x.count),x.source),tag('span',rate(dollarsPerThousand(x))+' / 1K','sub'));
      else td.append(tag('span','—','missing'));
      tr.append(td);
    }
    frag.append(tr);
  }
  return frag;
}
function paintPayouts(data){
  const q=$('payout-search'), by=$('payout-cycle'), sort=$('payout-sort'), out=$('payout-status'), tbody=$('payout-rows'), prev=$('payout-prev'), next=$('payout-next');
  const size=25;
  let page=0;
  for(const cycle of [...new Set(data.payouts.map(r=>r.payout_cycle))].sort().reverse()){
    const op=tag('option',fmtDate(cycle));op.value=cycle;by.append(op);
  }
  function update(){
    const key=q.value.trim().toLowerCase().replace(/^@/,'');
    const rows=data.payouts.filter(r=>r.creator_handle.toLowerCase().includes(key) && (!by.value||r.payout_cycle===by.value));
    const direction=sort.value==='high'?-1:sort.value==='low'?1:0;
    rows.sort((a,b)=>direction*(Number(a.payout_usd)-Number(b.payout_usd))||b.payout_cycle.localeCompare(a.payout_cycle)||a.creator_handle.localeCompare(b.creator_handle));
    const start=page*size,end=Math.min(start+size,rows.length),frag=document.createDocumentFragment();
    for(const r of rows.slice(start,end)){
      const tr=tag('tr'), source=tag('td');
      source.append(link('Disclosure',r.source_post_url));
      tr.append(tag('td','@'+r.creator_handle),tag('td',dollars.format(r.payout_usd),'numeric'),tag('td',fmtDate(r.payout_cycle)),source,tag('td',r.source_post_views?integer.format(r.source_post_views):'—','numeric'),tag('td',r.creator_follower_snapshot?integer.format(r.creator_follower_snapshot):'—','numeric'));
      frag.append(tr);
    }
    tbody.replaceChildren(frag);
    out.textContent=rows.length?'Showing '+(start+1)+'–'+end+' of '+integer.format(rows.length)+' payouts.':'No payouts match these filters.';
    $('payout-wrap').hidden=!rows.length;
    prev.disabled=page===0;next.disabled=end>=rows.length;
  }
  for(const x of [q,by,sort])x.addEventListener(x===q?'input':'change',()=>{page=0;update();});
  prev.addEventListener('click',()=>{if(page>0){page--;update();}});
  next.addEventListener('click',()=>{if(!next.disabled){page++;update();}});
  update();
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
function paintHero(data){
  const summary=rangeFor(data.observations,'verified');
  if(!summary){
    $('hero-rate').textContent='—';
    $('hero-evidence').textContent='No exact verified payout windows are available.';
    return;
  }
  $('hero-rate').textContent=summary.max<1 && summary.min>=.01
    ? Math.round(summary.min*100)+'–'+Math.round(summary.max*100)+'¢'
    : rate(summary.min)+'–'+rate(summary.max);
  $('hero-evidence').textContent='Observed in '+summary.sampleCount+' payout windows from '+summary.creatorCount+' creators. Public post views aren’t verified impressions.';
}
const wholeDollars=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0});
function calculate(data){
  const form=$('calc'), unit=$('metric'), mode=$('direction'), value=$('calc-value'), handle=$('calc-handle'), valLabel=$('calc-value-label');
  const result=$('estimate-output');
  let inputDirection=mode.value;
  function update(){
    if(inputDirection!==mode.value){
      inputDirection=mode.value;
      value.value=mode.value==='payout'?'1000000':'2700';
      value.min=mode.value==='payout'?'1':'0.01';value.step=mode.value==='payout'?'1':'0.01';
      valLabel.textContent=mode.value==='payout'?'Impressions in one payout period':'Target payout (USD)';
    }
    try {
      const s=rangeFor(data.observations,unit.value,handle.value);
      if(!s){result.replaceChildren(tag('p','No exact-window comparisons are available for this metric.','estimate-invalid'));return;}
      const n=Number(value.value);
      const guess=estimate(s,n,mode.value);
      const money=mode.value==='payout';
      const cash=guess.low<10?dollars:wholeDollars;
      const format=(x)=>money?cash.format(x):compact.format(x);
      const metric=labels[unit.value].toLowerCase();
      $('calc-title').textContent=money
        ? 'If I got '+compact.format(n)+' '+metric+' impressions, what would I get?'
        : 'How many '+metric+' impressions for '+dollars.format(n)+'?';
      result.replaceChildren(tag('strong',format(guess.low)+'–'+format(guess.high)+(money?'':' impressions'),'estimate-number'),
        tag('span','About '+format(guess.mid)+(money?'':' impressions')+' at the median observed rate.','result-line'));
      if(handle.value.trim()||unit.value!=='verified'){
        const context=s.creatorSpecific?'Uses this creator’s matched payout windows.':
          handle.value.trim()?'Not enough matches for this handle. Using the overall sample.':'Total and verified rates use different samples.';
        result.append(tag('span',context+' '+s.sampleCount+' '+metric+' samples from '+s.creatorCount+' '+(s.creatorCount===1?'creator':'creators')+'. Observed '+rate(s.min)+'–'+rate(s.max)+' per 1,000.','result-line cohort-note'));
      }
    } catch(e){result.replaceChildren(tag('p',e.message,'estimate-invalid'));}

  }
  form.addEventListener('submit',(e)=>{e.preventDefault();update();});
  mode.addEventListener('change',update);unit.addEventListener('change',update);
  update();
}
async function load(){
  try {
    const r=await fetch('./api/data');if(!r.ok)throw Error();
    const data=await r.json();
    $('data-mode').textContent=data.dataSource==='database'?'Live database':'Archive snapshot · live database not connected';
    if($('hero-rate'))paintHero(data);
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
async function loadHomeBoard(){
  const status=$('home-board-status'), list=$('home-board-rows');
  if(!status)return;
  try{
    const r=await fetch('/api/leaderboard');
    if(!r.ok)throw Error();
    const {cycle,rows}=await r.json();
    status.textContent=(rows.length?'Largest payouts with both screenshots confirmed.':'No entries with both screenshots confirmed yet.');
    for(const row of rows.slice(0,5)){
      const item=tag('li');
      const detail=tag('a',row.rank+'. @'+row.creator);
      detail.href='/leaderboard?cycle='+encodeURIComponent(row.cycle);
      const label=tag('div');label.append(detail,tag('span',fmtDate(row.cycle),'sub'));
      item.append(label,tag('strong',dollars.format(row.payoutUsd)));
      list.append(item);
    }
    list.hidden=!rows.length;
  }catch{status.textContent='Leaderboard temporarily unavailable.';}
}
loadHomeBoard();
load();
