/* Utilidades: formato de texto, dinero y fechas, tipos de donación. */
const KEY='lgc-v1',$=(s)=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'$'+Math.round(n).toLocaleString('es-AR'),fd=d=>d?d.split('-').reverse().join('/'):'—';
const ini=n=>n.split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase()||'?',uid=()=>Math.random().toString(36).slice(2,9);
/* Fechas en hora LOCAL (no UTC): de noche en Argentina, "hoy" sigue siendo hoy. */
const iso=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const dt=o=>{const d=new Date();d.setDate(d.getDate()+o);return iso(d)},T=dt(0);
/* Tipos de donación (el campo se guarda como "kind"; las anteriores quedan "Sin clasificar"). */
const KINDS=['Diezmo','Ofrenda','Ofrenda especial','Otra'],kindOf=n=>n.kind||'Sin clasificar';
const TAG={'Al día':'ok','Pendiente':'pend','Inactivo':'out'};
