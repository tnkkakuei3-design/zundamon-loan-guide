import {calculateLoan} from './loan-math.js';
const $=id=>document.getElementById(id);
const yen=new Intl.NumberFormat('ja-JP');
const form=$('loan-form');
const inputs=[$('principal'),$('rate'),$('months')];
function setError(message){$('form-error').textContent=message;$('form-error').hidden=!message;}
function clearOutput(){for(const id of ['monthly','total','interest'])$(id).textContent='—';$('result-condition').textContent='入力内容を確認してください';$('schedule-body').replaceChildren();$('principal-bar').style.width='0%';$('interest-bar').style.width='0%';$('cost-bar').setAttribute('aria-label','入力内容を確認してください');}
function refresh({report=false}={}){
  const valid=inputs.every(x=>x.value!==''&&x.checkValidity());
  if(!valid){clearOutput();setError('金額は0.1〜500万円、年利は0〜20％で入力してください。');if(report)form.reportValidity();return false;}
  const amount=Number($('principal').value),rate=Number($('rate').value),months=Number($('months').value);
  let result;try{result=calculateLoan(Math.round(amount*10000),rate,months);}catch{clearOutput();setError('入力内容を確認してください。');return false;}
  setError('');
  $('monthly').textContent=yen.format(result.payment);$('total').textContent=yen.format(result.total);$('interest').textContent=yen.format(result.interest);
  $('result-condition').textContent=`${amount.toLocaleString('ja-JP')}万円・年${rate.toFixed(1)}％・${months}回で試算`;
  $('principal-bar').style.width=`${result.principal/result.total*100}%`;$('interest-bar').style.width=`${result.interest/result.total*100}%`;
  $('cost-bar').setAttribute('aria-label',`返済総額${yen.format(result.total)}円のうち、元金${yen.format(result.principal)}円、利息${yen.format(result.interest)}円`);
  const frag=document.createDocumentFragment();
  for(const row of result.schedule){const tr=document.createElement('tr');for(const [i,v] of [row.month,row.payment,row.interest,row.balance].entries()){const el=document.createElement(i===0?'th':'td');if(i===0)el.scope='row';el.textContent=i===0?`${v}回目`:yen.format(v);tr.append(el);}frag.append(tr);}
  $('schedule-body').replaceChildren(frag);
  document.querySelectorAll('[data-amount]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.amount)===amount)));
  return true;
}
let timer;
inputs.forEach(input=>input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>refresh(),150);}));
document.querySelectorAll('[data-amount]').forEach(button=>button.addEventListener('click',()=>{$('principal').value=button.dataset.amount;refresh();}));
form.addEventListener('submit',event=>{event.preventDefault();clearTimeout(timer);if(refresh({report:true})){$('result').classList.remove('result-updated');void $('result').offsetWidth;$('result').classList.add('result-updated');if(matchMedia('(max-width:700px)').matches)$('result').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'center'});}});
const dialog=$('about-dialog'),about=$('about-button');
about.addEventListener('click',()=>dialog.showModal());
dialog.querySelectorAll('.dialog-close,.dialog-done').forEach(b=>b.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>about.focus());
refresh();
