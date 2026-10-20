/* Recientes: debajo de "Nuevo" y "Consulta" de cada sección (Donantes, Donaciones, Eventos) muestra
   los últimos registros, reutilizando las mismas tablas y tarjetas de los resultados (RES en views.js). */

const RECENT_CFG={
  donantes:{n:5,ord:'rec',t:'Donantes recientes',s:'Los que donaron últimamente',has:()=>S.donors.length},
  donaciones:{n:6,ord:'rec',t:'Últimas donaciones',s:'Lo que ingresó más recientemente',has:()=>S.donations.length},
  eventos:{n:3,ord:'rec',t:'Eventos recientes',s:'Los últimos eventos de la fundación',has:()=>S.events.length}
};

function recentBlock(c){
  const g=RECENT_CFG[c];if(!g||!g.has())return'';
  const sv=ui.f;ui.f={ord:g.ord};let h;
  try{h=RES[c]()}finally{ui.f=sv}
  h=h.replace(/<div class="stats">[\s\S]*?<\/div>(?=<div class="grid">|<div class="panel">)/,'');
  h=h.replace(/<tbody>([\s\S]*?)<\/tbody>/,(m,b)=>'<tbody>'+b.split(/(?=<tr)/).slice(0,g.n).join('')+'</tbody>');
  h=h.replace(/(<div class="grid">)([\s\S]*)(<\/div>)$/,(m,a,b,z)=>a+b.split(/(?=<button class="ev")/).slice(0,g.n).join('')+z);
  return`<section class="recent"><div class="rc-h"><div><h2>${g.t}</h2><p>${g.s}</p></div><button class="btn" onclick="ui.f={};go('resultados')">Ver todos →</button></div>${h}</section>`;
}
