const dialog=document.querySelector('#submit-payout-dialog'), form=document.querySelector('#submit-links');
const message=document.querySelector('#submit-message'), button=document.querySelector('#submit-button');
let previous=null,open=false;
for(const trigger of document.querySelectorAll('[data-open-submit]'))trigger.addEventListener('click',async()=>{
  previous=trigger;dialog.showModal();form.elements.payoutUrl.focus();
  try{
    const response=await fetch('/api/submissions',{cache:'no-store'});if(!response.ok)return;
    const state=await response.json();open=state.accepting===true;button.disabled=!open;
    message.textContent=open?'Submissions are reviewed before they appear.':'Submissions aren’t open yet. No links entered here are saved.';
    const status=document.querySelector('#queue-status');
    if(status&&Number.isInteger(state.pendingCount))status.textContent='Pending submissions: '+state.pendingCount+'.';
  }catch{}
});
dialog.querySelector('[data-close-submit]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{form.reset();previous?.focus();});
form.addEventListener('submit',async e=>{
  e.preventDefault();if(!open||!form.reportValidity())return;
  const payload={payoutUrl:form.elements.payoutUrl.value,impressionsUrl:form.elements.impressionsUrl.value,optIn:form.elements.optIn.checked};
  button.disabled=true;message.textContent='Submitting…';
  try{
    const response=await fetch('/api/submissions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const result=await response.json();
    if(response.status!==202){message.textContent=result.error||'Nothing was saved. Try again later.';return;}
    form.reset();message.textContent='Added to the review queue.';
  }catch{message.textContent='Couldn’t confirm a submission. Try again later.';}
  finally{button.disabled=!open;}
});
