/* Núcleo: estado de la app, navegación, filtros y pantallas de consulta. */
let S={donors:[],donations:[],events:[]};
const save=()=>fbSave();let migr=false;
const donor=id=>S.donors.find(d=>d.id===id),ev=id=>S.events.find(e=>e.id===id);
const dons=id=>S.donations.filter(n=>n.donorId===id);
const dTotal=d=>d.base+dons(d.id).reduce((a,n)=>a+n.amount,0);
const dLast=d=>[d.last,...dons(d.id).map(n=>n.date)].filter(Boolean).sort().pop()||'';
const who=n=>donor(n.donorId)?.name||n.who||'Donante anónimo';
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
const toast=m=>{const t=$('#t');t.textContent=m;t.className='s';clearTimeout(toast.i);toast.i=setTimeout(()=>t.className='',2200)};
const ICON={estadisticas:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',usuarios:'<circle cx="9" cy="8" r="3"/><path d="M3 20c.8-3.5 3-5 6-5s5.200 1.500 6 5"/><circle cx="17" cy="9" r="2.300"/><path d="M16.500 14.300c2.300.3 3.800 1.800 4.500 4.700"/>',panel:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',donantes:'<circle cx="12" cy="8" r="3.4"/><path d="M4.5 20c1.4-4 4.2-6 7.5-6s6.100 2 7.500 6"/>',donaciones:'<path d="M12 21s-7-4.600-9.300-8.800C1 8.700 2.600 5.400 5.900 5c2-.2 3.600.9 4.900 2.400C12 5.900 13.700 4.800 15.700 5c3.300.4 4.900 3.700 3.200 7.200C16.700 16.400 12 21 12 21z"/>',eventos:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'};
const NAV=[['panel','Panel principal'],['donantes','Donantes'],['donaciones','Donaciones'],['eventos','Eventos'],['estadisticas','Estadísticas']];
const MESES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const nz=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const dOk=(d,f)=>!(f.desde||f.hasta||f.mes||f.anio)||[d.last,...dons(d.id).map(n=>n.date)].filter(Boolean).some(x=>dm(x,f));
const dm=(d,f)=>(!f.desde||d>=f.desde)&&(!f.hasta||d<=f.hasta)&&(!f.mes||d.slice(5,7)==f.mes)&&(!f.anio||d.slice(0,4)==f.anio);
let ui;const reset=()=>ui={mode:'home',f:{}};reset();
const aplicar=()=>{const f=ui.f;if(f.desde&&f.hasta&&f.desde>f.hasta){toast('La fecha "Desde" no puede ser posterior a "Hasta".');return}go('resultados')};
const go=m=>{ui.mode=m;render();scrollTo(0,0)};
const navGo=k=>{if(cur()==k){reset();render();scrollTo(0,0)}};
const cur=()=>{const h=location.hash.slice(1);return VIEW[h]&&(h!='usuarios'||can('usuarios'))?h:'inicio'};
const stat=(l,v,p)=>`<div class="stat"><div class="l">${l}</div><div class="v">${v}</div>${p?`<span class="pill">${p}</span>`:''}</div>`;
const head=(t,s,a)=>`<div class="top"><div><h1>${t}</h1><p>${s}</p></div><div class="acts">${a}</div></div>`;
const A0={d:'<button class="btn primary" onclick="editDonor()">+ Nuevo donante</button>',n:'<button class="btn primary" onclick="editDon()">+ Registrar donación</button>',e:'<button class="btn primary" onclick="editEv()">+ Nuevo evento</button>'};
const years=()=>{const y=new Set([T.slice(0,4)]);S.donations.forEach(n=>y.add(n.date.slice(0,4)));S.events.forEach(e=>y.add(e.date.slice(0,4)));S.donors.forEach(d=>{const l=dLast(d);if(l)y.add(l.slice(0,4))});return[...y].sort().reverse()};
const filt=c=>{const M=[['','Todos'],...MESES.map((m,i)=>[String(i+1).padStart(2,'0'),m])],Y=[['','Todos'],...years().map(y=>[y,y])],dates=[{k:'desde',l:'Desde',t:'date'},{k:'hasta',l:'Hasta',t:'date'},{k:'mes',l:'Mes',o:M},{k:'anio',l:'Año',o:Y}];
return{
donantes:[{k:'q',l:'Buscar por nombre o email',q:1,ph:'Ej: María o maria@email.com'},{k:'ini',l:'Inicial del nombre',ph:'Ej: M',max:1},{k:'tipo',l:'Tipo',o:[['','Todos'],'Afiliado','Ocasional']},{k:'estado',l:'Estado',o:[['','Todos'],'Al día','Pendiente','Inactivo']},{k:'desde',l:'Donó desde',t:'date'},{k:'hasta',l:'Donó hasta',t:'date'},{k:'mes',l:'Mes de donación',o:M},{k:'anio',l:'Año de donación',o:Y},{k:'ord',l:'Ordenar',o:[['az','A – Z'],['za','Z – A'],['tot','Mayor total donado'],['rec','Donó más recientemente']]}],
donaciones:[{k:'q',l:'Buscar por donante o concepto',q:1},...dates,{k:'origen',l:'Origen',o:[['','Todos'],'Donación','Evento']},{k:'tipo',l:'Tipo de donación',o:[['','Todos'],...KINDS,'Sin clasificar']},{k:'ord',l:'Ordenar',o:[['rec','Más recientes'],['ant','Más antiguas'],['mon','Mayor monto'],['men','Menor monto']]}],
eventos:[{k:'q',l:'Buscar por nombre o lugar',q:1},...dates,{k:'estado',l:'Estado',o:[['','Todos'],'Próximo','Finalizado']},{k:'ord',l:'Ordenar',o:[['prox','Más cercanos a hoy'],['rec','Más recientes'],['ant','Más antiguos'],['gan','Mayor ganancia'],['az','A – Z']]}]}[c]};
const ffld=x=>{const v=ui.f[x.k]??'';const i=x.o?`<select onchange="ui.f['${x.k}']=this.value">${x.o.map(o=>{const[a,b]=Array.isArray(o)?o:[o,o];return`<option value="${esc(a)}" ${a==v?'selected':''}>${esc(b)}</option>`}).join('')}</select>`:`<input type="${x.q?'search':(x.t||'text')}" value="${esc(v)}" ${x.ph?`placeholder="${esc(x.ph)}"`:''} ${x.max?`maxlength="${x.max}"`:''} oninput="ui.f['${x.k}']=this.value">`;return`<label class="f ${x.q?'q':''}">${x.l}${i}</label>`};
const summ=c=>{const a=filt(c).filter(x=>x.k!='ord'&&ui.f[x.k]).map(x=>{const v=ui.f[x.k];let t=v;if(x.o){const o=x.o.find(o=>(Array.isArray(o)?o[0]:o)==v);t=Array.isArray(o)?o[1]:v}else if(x.t=='date')t=fd(v);return`<span class="pill">${x.l}: ${esc(t)}</span>`});return`<div class="sumf"><span>${a.length?'Filtros aplicados:':'Sin filtros: se muestran todos los registros.'}</span>${a.join('')}</div>`};
const TX={
donantes:{t:'Donantes',s:'Afiliados y donantes ocasionales de la fundación',n:'editDonor()',nd:'Cargá un nuevo donante en la base.',cd:'Buscá donantes por nombre, tipo, estado o fecha y mirá su historial.',fs:'Elegí los filtros y tocá Filtrar para ver los donantes.'},
donaciones:{t:'Donaciones',s:'Todos los ingresos registrados por donación',n:'editDon()',nd:'Registrá una nueva donación.',cd:'Buscá donaciones por donante, fecha u origen.',fs:'Elegí los filtros y tocá Filtrar para ver las donaciones.'},
eventos:{t:'Eventos',s:'Actividades para recaudar fondos, pasadas y por venir',n:'editEv()',nd:'Creá un nuevo evento de recaudación.',cd:'Buscá eventos por nombre, fecha o estado.',fs:'Elegí los filtros y tocá Filtrar para ver los eventos.'}};
const ICO={plus:'<path d="M12 5v14M5 12h14"/>',search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>'};
const choice=(i,t,d,fn)=>`<button class="choice" onclick="${fn}"><span class="ci"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${ICO[i]}</svg></span><h3>${t}</h3><p>${d}</p></button>`;
const A={get d(){return can('crear')?A0.d:''},get n(){return can('crear')?A0.n:''},get e(){return can('crear')?A0.e:''}};
const sect=c=>{const x=TX[c];
if(ui.mode=='filtros')return head(x.t,x.fs,`<button class="btn" onclick="go('home')">← Volver</button>`)+`<div class="filt" onkeydown="if(event.key==='Enter'&&event.target.tagName==='INPUT'){event.preventDefault();aplicar()}">${filt(c).map(ffld).join('')}<div class="fb"><button type="button" class="btn" onclick="ui.f={};render()">Limpiar</button><button type="button" class="btn primary" onclick="aplicar()">Filtrar</button></div></div>`;
if(ui.mode=='resultados')return head(x.t,'Resultados de tu consulta',`<button class="btn" onclick="go('filtros')">Cambiar filtros</button>${can('crear')?`<button class="btn primary" onclick="${x.n}">+ Nuevo</button>`:''}`)+summ(c)+RES[c]();
return head(x.t,x.s,'')+`<div class="choices">${can('crear')?choice('plus','Nuevo',x.nd,x.n):''}${choice('search','Consulta',x.cd,"go('filtros')")}</div>${typeof recentBlock=='function'?recentBlock(c):''}`};
