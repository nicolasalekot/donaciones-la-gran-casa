/* Inicio: pantalla de bienvenida con el título, el logo y tarjetas de vidrio hacia cada sección.
   Se carga después de views.js (agrega VIEW.inicio) y es la pantalla por defecto (ver cur() en core.js). */

NAV.unshift(['inicio','Inicio']);
ICON.inicio='<path d="M3 11.500 12 4l9 7.500"/><path d="M5 10v10h5v-6h4v6h5V10"/>';

const ARROW='<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const KIND_COL={'Diezmo':'#D9AC45','Ofrenda':'#7FD1A4','Ofrenda especial':'#7A93E0','Otra':'#B88AD6','Sin clasificar':'#8C8A96'};

/* Cifras que usa la pantalla, calculadas con los datos que ya están cargados. */
function homeData(){
  const now=new Date(),y=String(now.getFullYear()),mi=now.getMonth();
  const yr=S.donations.filter(n=>n.date&&n.date.slice(0,4)==y);
  const byM=Array(12).fill(0);yr.forEach(n=>{byM[+n.date.slice(5,7)-1]+=n.amount});
  const tot=sum(yr,n=>n.amount);
  const cm=byM[mi],pm=mi>0?byM[mi-1]:0;
  const delta=pm>0?Math.round((cm-pm)/pm*100):null;
  const last6=[];for(let i=5;i>=0;i--){const k=mi-i;if(k>=0)last6.push({m:MESES[k].slice(0,3),v:byM[k]})}
  const disp=sum(S.donations.filter(n=>n.origin!='Evento'),n=>n.amount);
  const kinds=[...KINDS,'Sin clasificar'].map(k=>({k,t:sum(yr.filter(n=>kindOf(n)==k),n=>n.amount)})).filter(r=>r.t>0);
  const next=S.events.filter(e=>e.status=='Próximo'&&e.date>=iso(now)).sort((a,b)=>a.date.localeCompare(b.date));
  const top=[...S.donors].sort((a,b)=>dTotal(b)-dTotal(a)).slice(0,4);
  return{y,yr,tot,cm,mname:MESES[mi].toLowerCase(),nmes:yr.filter(n=>+n.date.slice(5,7)==mi+1).length,delta,last6,disp,kinds,next,top,afil:S.donors.filter(d=>d.type=='Afiliado').length};
}

/* Línea suave para la tarjeta flotante (valores de los últimos meses). */
function sparkSvg(vals){
  const W=240,H=64,P=6,mx=Math.max(1,...vals),n=Math.max(2,vals.length);
  const pts=vals.map((v,i)=>[P+i*(W-2*P)/(n-1),H-P-(v/mx)*(H-2*P)]);
  if(pts.length<2)pts.push([W-P,H-P]);
  let d='M'+pts[0][0].toFixed(1)+' '+pts[0][1].toFixed(1);
  for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],cx=(a[0]+b[0])/2;d+=` C${cx.toFixed(1)} ${a[1].toFixed(1)}, ${cx.toFixed(1)} ${b[1].toFixed(1)}, ${b[0].toFixed(1)} ${b[1].toFixed(1)}`}
  const f=d+` L${pts[pts.length-1][0].toFixed(1)} ${H} L${pts[0][0].toFixed(1)} ${H} Z`;
  return`<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="spf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--gold)" stop-opacity=".38"/><stop offset="1" style="stop-color:var(--gold)" stop-opacity="0"/></linearGradient></defs><path d="${f}" fill="url(#spf)"/><path d="${d}" fill="none" style="stroke:var(--gold)" stroke-width="2.200" stroke-linecap="round"/></svg>`;
}

/* Una tarjeta de vidrio que lleva a una sección. */
const gcard=(k,t,s,vis,foot,cls='')=>`<a class="gc ${cls}" href="#${k}"><div class="gc-h"><h3>${t}</h3><p>${s}</p></div><div class="gc-v">${vis}</div><div class="gc-f"><span>${foot}</span><i class="arr">${ARROW}</i></div></a>`;

VIEW.inicio=()=>{
  const h=homeData(),nd=h.yr.length;
  const dlt=h.delta==null?`${nd} ${nd==1?'donación':'donaciones'} en ${h.y}`:`<b class="${h.delta<0?'dn':'up'}">${h.delta<0?'↓':'↑'} ${Math.abs(h.delta)}%</b> respecto al mes anterior`;
  const ev0=h.next[0],ico=(p)=>`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
  const IC_CAL=ico('<rect x="3.500" y="5" width="17" height="15.500" rx="3"/><path d="M8 3v4M16 3v4M3.500 10h17"/>'),IC_PPL=ico('<circle cx="9" cy="8" r="3.500"/><path d="M2.500 20c.6-3.600 3.100-5.500 6.500-5.500s5.900 1.900 6.500 5.500"/><path d="M16 4.800a3.400 3.400 0 0 1 0 6.400M18.500 14.800c1.600.8 2.600 2.600 3 5.200"/>'),IC_EVT=ico('<path d="M12 3.500l2.600 5.300 5.800.8-4.200 4.100 1 5.800L12 16.800l-5.200 2.700 1-5.800L3.600 9.600l5.800-.8z"/>');
  const nxt=ev0?`<div class="float-card mini wide m3"><span class="fc-i">${IC_EVT}</span><div><small>Próximo evento · ${fd(ev0.date)}</small><b>${esc(ev0.name)}</b>${ev0.goal?`<div class="bar"><i style="width:${Math.min(100,Math.round((ev0.ing||0)/ev0.goal*100))}%"></i></div><em>${money(ev0.ing||0)} de ${money(ev0.goal)}</em>`:`<em>${esc(ev0.place||'')}</em>`}</div></div>`:'';
  const hero=`<section class="hero">
    <div class="bleed"><i class="b-glow"></i><img class="clef3d" src="img/logo-3d.png" alt="Logo de la Fundación La Gran Casa"></div>
    <div class="hero-txt">
      <h1 class="hero-t"><span>Fundación</span><span class="gold">La Gran Casa</span><small>Sitio web de gestión de donaciones</small></h1>
      <div class="hero-b">${can('crear')?'<button class="btn primary big" onclick="editDon()">Registrar donación '+ARROW+'</button>':''}<a class="btn ghost big" href="#panel">Ver el panel</a></div>
    </div>
    <div class="hero-vis" aria-hidden="false">
      <div class="float-stack"><div class="float-card big"><span class="fc-i"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.900" stroke-linecap="round" stroke-linejoin="round"><path d="M20.800 4.600a5.500 5.500 0 0 0-7.800 0L12 5.700l-1-1.100a5.500 5.500 0 0 0-7.800 7.800l1 1.100L12 21l7.800-7.500 1-1.100a5.500 5.500 0 0 0 0-7.800z"/></svg></span>
        <small>Recaudado en ${h.y}</small><b>${money(h.tot)}</b>${sparkSvg(h.last6.map(x=>x.v))}<em>${dlt}</em></div>
        <div class="float-card mini m1"><span class="fc-i">${IC_CAL}</span><small>En ${h.mname}</small><b>${money(h.cm)}</b><em>${h.nmes} ${h.nmes==1?'donación':'donaciones'}</em></div>
        <div class="float-card mini m2"><span class="fc-i">${IC_PPL}</span><small>Donantes</small><b>${S.donors.length}</b><em>${h.afil} ${h.afil==1?'afiliado':'afiliados'}</em></div>
        ${nxt}
      </div>
    </div></section>`;

  /* ---- tarjetas ---- */
  const mxb=Math.max(1,...h.last6.map(x=>x.v));
  const bars=h.last6.length?`<div class="mbars">${h.last6.map(x=>`<div><i style="--h:${Math.max(.06,x.v/mxb).toFixed(3)}"></i><span>${x.m}</span></div>`).join('')}</div>`:'<p class="gc-e">Todavía no hay donaciones este año.</p>';
  const av=h.top.length?`<div class="avs">${h.top.map(d=>`<span class="avc">${esc(ini(d.name))}</span>`).join('')}${S.donors.length>4?`<span class="avc more">+${S.donors.length-4}</span>`:''}</div>`:'<p class="gc-e">Todavía no hay donantes.</p>';
  const ev=h.next[0],evv=ev?`<div class="evm"><b>${esc(ev.name)}</b><small>${fd(ev.date)}${ev.place?' · '+esc(ev.place):''}</small>${ev.goal?`<div class="bar"><i style="width:${Math.min(100,Math.round((ev.ing||0)/ev.goal*100))}%"></i></div><small>${money(ev.ing||0)} de ${money(ev.goal)}</small>`:''}</div>`:'<p class="gc-e">No hay eventos programados.</p>';
  const kt=sum(h.kinds,r=>r.t);
  const seg=h.kinds.length?`<div class="seg">${h.kinds.map(r=>`<i style="flex:${r.t};background:${KIND_COL[r.k]}" title="${esc(r.k)}"></i>`).join('')}</div><ul class="lgd">${h.kinds.map(r=>`<li><i style="background:${KIND_COL[r.k]}"></i>${esc(r.k)} <b>${Math.round(r.t/kt*100)}%</b></li>`).join('')}</ul>`:'<p class="gc-e">Cuando haya donaciones del año, acá ves cómo se reparten por tipo.</p>';
  const dispv=`<div class="bignum">${money(h.disp)}<small>disponible para usar</small></div>`;
  const pend=users.filter(u=>u.pending).length,tu=users.length;
  const usv=`<div class="avs">${[...users].slice(0,5).map(u=>`<span class="avc">${esc(ini(u.name))}</span>`).join('')}</div><p class="gc-n">${pend?`<b class="hl">${pend} ${pend==1?'cuenta espera':'cuentas esperan'} aprobación</b>`:'No hay cuentas pendientes'}</p>`;

  const cards=`<section class="bento-h"><h2>¿Qué querés<br><span class="gold"><i class="chip"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></i> hacer hoy?</span></h2><p>Entrá directo a lo que necesitás.</p></section>
  <section class="bento">
    ${gcard('donaciones','Donaciones','Todo lo que ingresó, con su tipo',bars,`${nd} en ${h.y}`,'c4')}
    ${gcard('donantes','Donantes','Afiliados y ocasionales',av,`${S.donors.length} donantes · ${h.afil} afiliados`,'c4')}
    ${gcard('eventos','Eventos','Metas, ingresos y egresos',evv,h.next.length?`${h.next.length} ${h.next.length==1?'próximo':'próximos'}`:'Sin próximos','c4')}
    ${gcard('estadisticas','Estadísticas','Cómo se reparten los ingresos',seg,'Por mes, origen y tipo','c7')}
    ${gcard('panel','Panel principal','Resumen de la fundación',dispv,'Ver todas las cifras','c5')}
    ${can('usuarios')?gcard('usuarios','Usuarios','Quién puede entrar y qué puede hacer',usv,`${tu} ${tu==1?'cuenta':'cuentas'}`,'c12 wide'):''}
  </section>`;
  return`<div class="home">${hero}${cards}</div>`;
};
