/* Componentes: ventanas, confirmaciones, selector con buscador y formularios. */
/* modales y formularios */
const M=$('#m');M.addEventListener('click',e=>{if(e.target===M)closeM()});
const closeM=()=>M.close();
function modal(t,b){M.innerHTML=`<div class="mh"><h2>${t}</h2><button class="x" onclick="closeM()" aria-label="Cerrar">×</button></div>${b}`;if(!M.open)M.showModal()}
function ask(t,msg,fn){modal(t,`<div class="mb"><p style="margin:8px 0 18px;font-size:17.5px;line-height:1.5">${msg}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn" onclick="closeM()">Cancelar</button><button class="btn primary" id="ok" style="background:var(--red);border-color:var(--red);color:#fff">Confirmar</button></div></div>`);$('#ok').onclick=()=>{closeM();fn()}}
/* ---- selector con buscador (combobox) ---- */
const CB={};
const norm=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const cbHtml=(f,v)=>{CB[f.k]=f.c;const val=v[f.k]??f.d??'',it=f.c.find(x=>x[0]==val)||f.c[0];
return`<div class="f ${f.w?'w':''}">${f.l}<div class="cb" data-k="${f.k}"><input type="text" class="cbi" ${val?'':'autofocus'} autocomplete="off" role="combobox" aria-expanded="false" aria-autocomplete="list" placeholder="${esc(f.ph||'Escribí para buscar…')}" value="${esc(it[1])}"><input type="hidden" name="${f.k}" value="${esc(it[0])}"><ul class="cbl" role="listbox" hidden></ul></div></div>`};
function initCombos(){M.querySelectorAll('.cb').forEach(box=>{
const items=CB[box.dataset.k]||[],inp=box.querySelector('.cbi'),hid=box.querySelector('input[type=hidden]'),ul=box.querySelector('.cbl'),MAX=40;
let sel=items.find(x=>x[0]==hid.value)||items[0],list=[],act=0,q='',more=0,fresh=false;
const hl=t=>{if(!q)return esc(t);const i=norm(t).indexOf(q);return i<0?esc(t):esc(t.slice(0,i))+'<mark>'+esc(t.slice(i,i+q.length))+'</mark>'+esc(t.slice(i+q.length))};
const draw=()=>{ul.innerHTML=(list.length?list.map((x,i)=>`<li role="option" data-i="${i}" class="${i==act?'on':''} ${x===sel?'sel':''}"><span>${hl(x[1])}</span>${x[2]?`<small>${hl(x[2])}</small>`:''}</li>`).join(''):'<li class="none">No hay nadie con ese nombre</li>')+(more?`<li class="none">Hay ${more} más: seguí escribiendo para afinar</li>`:'');
const a=ul.querySelector('li.on');if(a)a.scrollIntoView({block:'nearest'})};
const run=t=>{q=norm(t.trim());let r=items.filter(x=>!q||norm(x[1]+' '+(x[2]||'')).includes(q));
if(q)r.sort((a,b)=>norm(b[1]).startsWith(q)-norm(a[1]).startsWith(q));
more=Math.max(0,r.length-MAX);list=r.slice(0,MAX);act=q?0:Math.max(0,list.indexOf(sel));ul.hidden=false;inp.setAttribute('aria-expanded','true');draw()};
const close=()=>{ul.hidden=true;inp.setAttribute('aria-expanded','false');inp.value=sel[1]};
const pick=i=>{const x=list[i];if(!x)return;sel=x;hid.value=x[0];close()};
inp.addEventListener('focus',()=>{fresh=true;inp.select();run('')});
inp.addEventListener('mouseup',e=>{if(fresh){e.preventDefault();fresh=false}});
inp.addEventListener('click',()=>{if(ul.hidden){inp.select();run('')}});
inp.addEventListener('input',()=>run(inp.value));
inp.addEventListener('blur',close);
inp.addEventListener('keydown',e=>{const k=e.key;
if(k=='ArrowDown'||k=='ArrowUp'){e.preventDefault();if(ul.hidden)return run('');if(list.length){act=(act+(k=='ArrowDown'?1:-1)+list.length)%list.length;draw()}}
else if(k=='Enter'&&!ul.hidden){e.preventDefault();pick(act)}
else if(k=='Escape'&&!ul.hidden){e.preventDefault();e.stopPropagation();close()}});
ul.addEventListener('mousedown',e=>e.preventDefault());
ul.addEventListener('click',e=>{const li=e.target.closest('li[data-i]');if(li)pick(+li.dataset.i)})})}
const fld=(f,v)=>{if(f.c)return cbHtml(f,v);const val=v[f.k]??f.d??'';const i=f.o?`<select name="${f.k}" ${f.r?'required':''}>${f.o.map(o=>{const[a,b]=Array.isArray(o)?o:[o,o];return`<option value="${esc(a)}" ${a==val?'selected':''}>${esc(b)}</option>`}).join('')}</select>`:`<input name="${f.k}" type="${f.t||'text'}" value="${esc(val)}" ${f.r?'required':''} ${f.t=='number'?'min="0" step="any"':''}>`;return`<label class="f ${f.w?'w':''}">${f.l}${i}</label>`};
function form(t,fs,v,ok,extra=''){modal(t,`<form id="fm">${fs.map(f=>fld(f,v)).join('')}<div class="ft">${extra}<button type="button" class="btn" onclick="closeM()">Cancelar</button><button class="btn primary">Guardar</button></div></form>`);initCombos();$('#fm').onsubmit=e=>{e.preventDefault();ok(Object.fromEntries(new FormData(e.target)));closeM()}}
const done=m=>{save();toast(m);render()};
