/* Copia de seguridad (solo administrador): descarga los datos como archivo.
   - JSON: copia completa (donantes, donaciones y eventos), sirve para restaurar o guardar.
   - CSV: lista de donaciones para abrir en Excel o Google Sheets. */

function download(name,text,mime){
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([text],{type:mime}));
  a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),4000);
}

function backupJson(){
  if(!need('usuarios'))return;
  const data={app:'Donaciones La Gran Casa',exportado:new Date().toISOString(),donantes:S.donors,donaciones:S.donations,eventos:S.events};
  download('lagrancasa-copia-'+T+'.json',JSON.stringify(data,null,2),'application/json');
  toast('Copia descargada: '+S.donors.length+' donantes, '+S.donations.length+' donaciones, '+S.events.length+' eventos');
}

function backupCsv(){
  if(!need('usuarios'))return;
  const q=v=>{v=String(v??'');return/[";\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v};
  const rows=[['Fecha','Donante','Concepto','Tipo de donación','Origen','Monto']];
  [...S.donations].sort((a,b)=>b.date.localeCompare(a.date)).forEach(n=>rows.push([n.date,who(n),n.concept,kindOf(n),n.origin,n.amount]));
  download('lagrancasa-donaciones-'+T+'.csv','﻿'+rows.map(r=>r.map(q).join(';')).join('\r\n'),'text/csv;charset=utf-8');
  toast('Lista de donaciones descargada ('+S.donations.length+')');
}

const backupPanel=()=>`<div class="panel"><h3>Copia de seguridad</h3><p class="note" style="margin:0 0 14px">Descargá los datos a tu computadora para tener un respaldo. Hacelo cada tanto, por ejemplo una vez por mes.</p><div style="display:flex;flex-wrap:wrap;gap:10px"><button class="btn primary" onclick="backupJson()">Descargar copia completa (JSON)</button><button class="btn" onclick="backupCsv()">Descargar donaciones (Excel)</button></div></div>`;
