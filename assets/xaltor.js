/* Xal'tor — asistente del portafolio. Busca en assets/xaltor-data.js (contenido de unidades + base de datos general). */
(()=>{
const panel=document.getElementById('botPanel'),toggle=document.getElementById('botToggle'),close=document.getElementById('botClose'),msgs=document.getElementById('botMessages'),form=document.getElementById('botForm'),input=document.getElementById('botInput');
if(!panel||!window.XALTOR)return;
const D=window.XALTOR;
const STOP=new Set('el la los las un una unos unas de del al y o u en a por para con sin sobre que es son se su sus lo le les mi me te tu como cual cuales cuando donde quien quienes cuanto muy mas menos pero si no ya hay ser esta este esto estos estas eso esa ese hace hacer puedes puedo dime explica explicame dame quiero necesito favor tiene tienen significa'.split(' '));
const norm=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const stem=w=>w.length>5?w.replace(/(es|s)$/,''):w;
const tok=s=>(norm(s).match(/[a-z0-9_]+/g)||[]).filter(w=>w.length>1&&!STOP.has(w)).map(stem);
const strip=h=>h.replace(/<[^>]+>/g,' ');
let avg=0;
D.forEach(d=>{d._t=tok((d.t+' ').repeat(3)+(d.k||'')+' '+strip(d.b||'')+' '+(d.x||''));avg+=d._t.length;d._f={};d._t.forEach(w=>d._f[w]=(d._f[w]||0)+1)});
avg/=D.length;
const df={};D.forEach(d=>Object.keys(d._f).forEach(w=>df[w]=(df[w]||0)+1));
const idf=w=>Math.log(1+(D.length-(df[w]||0)+.5)/((df[w]||0)+.5));
function search(q){
  const qt=[...new Set(tok(q))];if(!qt.length)return[];
  return D.map(d=>{let s=0;qt.forEach(w=>{const f=d._f[w]||0;if(f)s+=idf(w)*(f*2.2)/(f+1.2*(.25+.75*d._t.length/avg))});
    const tt=norm(d.t);qt.forEach(w=>{if(tt.includes(w))s+=idf(w)*.8});
    return{d,s:s*(d.w||1)}}).filter(r=>r.s>0).sort((a,b)=>b.s-a.s);
}
const ROM={i:1,ii:2,iii:3,iv:4};
function nav(q){
  const x=norm(q),u=x.match(/unidad\s*(iv|iii|ii|i|[1-4])\b/),w=x.match(/semana\s*0?(1[0-6]|[1-9])\b/);
  if(!u&&!w)return null;
  let un=u?(ROM[u[1]]||+u[1]):0,wk=w?+w[1]:0,loc=0;
  if(wk){if(!un)un=Math.ceil(wk/4);loc=wk>4?wk-4*(un-1):wk;if(loc<1||loc>4)return null}
  return D.find(d=>d.nav&&d.nav[0]===un&&d.nav[1]===loc);
}
const e=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');
function answer(q){
  const x=norm(q).trim();
  if(/^(hola|buenas|hey|saludos|buen dia|buenos dias|buenas tardes|buenas noches)\b/.test(x))return 'Saludos, explorador. Pregúntame por el contenido de tus <strong>unidades y semanas</strong> o sobre <strong>bases de datos</strong> (SQL, índices, seguridad, backups, Azure…).';
  if(/^(gracias|muchas gracias|ok|vale|listo)\b/.test(x))return 'Con gusto. Si necesitas algo más del portafolio o de bases de datos, aquí estoy ✦';
  const n=nav(q);if(n)return n.b;
  const cm=x.match(/caso\s*0*(\d{1,2})\b/);if(cm){const re=new RegExp('Caso 0*'+cm[1]+'\\.');const c=D.find(d=>d.x&&re.test(d.x));if(c)return '<div class="bot-src">'+e(c.x).replace(/\n/g,'<br>')+'</div><small>📄 Fuente: <a href="'+c.r+'" target="_blank" rel="noopener">'+e(c.s)+'</a></small>'}
  const r=search(q);
  if(!r.length||r[0].s<2.2)return 'No encontré eso en mi base de conocimiento. Prueba con términos como <em>índice clustered</em>, <em>JOIN</em>, <em>backup diferencial</em>, <em>esquemas</em> o <em>Unidad 2 Semana 8</em>.';
  const top=r[0].d;let out='';
  if(top.b){out=top.b;}else{out='<div class="bot-src">'+e(top.x).replace(/\n/g,'<br>')+'</div><small>📄 Fuente: <a href="'+top.r+'" target="_blank" rel="noopener">'+e(top.s)+'</a></small>';}
  const seen=new Set([top.t]);const more=[];
  for(const it of r.slice(1)){const d=it.d;if(it.s<r[0].s*.5||more.length>=2)break;
    if(d.nav||seen.has(d.t)&&!d.r)continue;
    if(d.r){if(top.r===d.r||more.some(m=>m.r===d.r))continue;more.push(d)}else if(!top.b||d.b){if(!seen.has(d.t)){seen.add(d.t);more.push(d)}}}
  const src=more.filter(d=>d.r);
  if(top.b&&!src.length){const s2=r.find(i=>i.d.r&&i.s>=r[0].s*.4);if(s2)src.push(s2.d)}
  if(src.length)out+='<br><small>📄 También en tu portafolio: '+src.slice(0,2).map(d=>'<a href="'+d.r+'" target="_blank" rel="noopener">'+e(d.s)+'</a>').join(' · ')+'</small>';
  return out;
}
const add=(t,user)=>{const d=document.createElement('div');d.className='bot-msg'+(user?' user':'');if(user)d.textContent=t;else d.innerHTML=t;msgs.appendChild(d);msgs.scrollTop=msgs.scrollHeight};
const ask=q=>{if(!q.trim())return;add(q,true);input.value='';setTimeout(()=>add(answer(q)),260)};
toggle.onclick=()=>panel.classList.toggle('open');close.onclick=()=>panel.classList.remove('open');
form.onsubmit=ev=>{ev.preventDefault();ask(input.value)};
document.querySelectorAll('.bot-quick button').forEach(b=>b.onclick=()=>ask(b.dataset.q));
window.xaltorAsk=answer;
})();
