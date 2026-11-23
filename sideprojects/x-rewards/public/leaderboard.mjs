const $=id=>document.getElementById(id);
const select=$('cycle'), share=$('share'), status=$('status');
const number=new Intl.NumberFormat('en-US'), usd=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'});
const date=new Intl.DateTimeFormat('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
const fmt=s=>date.format(new Date(s+'T00:00:00Z'));
const el=(name,text)=>{const x=document.createElement(name);if(text!==undefined)x.textContent=text;return x;};
const cell=(x,label,cls)=>{const td=el('td',x);td.dataset.label=label;if(cls)td.className=cls;return td;};
const proof=(text,url)=>{const a=el('a',text);a.href=url;a.rel='noreferrer noopener';return a;};
let serial=0, chosen='';
function urls(cycle){
  const q=cycle?'?cycle='+encodeURIComponent(cycle):'';
  $('json').href='/api/leaderboard'+q;
  $('csv').href='/leaderboard.csv'+q;
}
async function load(cycle='',invalid=false){
  const run=++serial;
  share.disabled=true;
  status.textContent='Loading leaderboard…';$('table').hidden=true;
  try{
    const response=await fetch('/api/leaderboard'+(cycle?'?cycle='+encodeURIComponent(cycle):''));
    if(run!==serial)return;
    if(cycle&&[400,404].includes(response.status))return load('',true);
    if(!response.ok)throw Error();
    const board=await response.json();
    if(run!==serial)return;
    chosen=board.cycle||'';
    if(board.lastReviewedOn)$('review-status').textContent='Last leaderboard review: '+fmt(board.lastReviewedOn)+'.';
    urls(chosen);
    select.replaceChildren(...board.cycles.map(x=>{const o=el('option',fmt(x));o.value=x;return o;}));
    select.disabled=!board.cycles.length;select.value=chosen;share.disabled=false;
    status.textContent=(invalid?'Unknown cycle. Showing the default cycle. ':'')+(board.rows.length?number.format(board.rows.length)+' proof-reviewed '+(board.rows.length===1?'entry.':'entries.'):'No entries with both screenshots confirmed for this cycle yet.');
    $('rows').replaceChildren(...board.rows.map(r=>{
      const tr=el('tr'), th=el('th',r.rank+'. @'+r.creator);th.scope='row';
      const refs=cell(undefined,'Public proof','proofs');refs.append(proof('Payout screenshot',r.payoutProof),proof('Impressions screenshot',r.impressionsProof));
      tr.append(th,cell(usd.format(r.payoutUsd),'Payout','numeric payout'),cell(number.format(r.verifiedImpressions),'Verified impressions','numeric'),cell(fmt(r.start)+' – '+fmt(r.end),'Analytics dates'),refs);
      return tr;
    }));
    $('table').hidden=!board.rows.length;
  }catch{if(run===serial)status.textContent='Couldn’t load the leaderboard. Try again in a moment.';}
}
select.addEventListener('change',()=>{
  const next=new URL(location.href);next.searchParams.set('cycle',select.value);history.replaceState(null,'',next);
  $('share-status').hidden=true;
  load(select.value);
});
share.addEventListener('click',async()=>{
  const href=new URL('/leaderboard',location.origin);
  if(chosen)href.searchParams.set('cycle',chosen);
  const result=$('share-status');result.hidden=false;
  try{await navigator.clipboard.writeText(href.href);result.textContent='Cycle link copied.';}
  catch{result.replaceChildren(proof(href.href,href.href));}
});
load(new URLSearchParams(location.search).get('cycle')||'');
