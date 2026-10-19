/* Importación de datos que se guardaban antes en el navegador (versión vieja). */
/* ---- datos que ya tenías en este navegador ---- */
const hasLocal=()=>{try{const j=JSON.parse(localStorage.getItem(KEY));return !!(j&&j.donors&&j.donors.length)}catch(e){return false}};
const canImport=()=>can('restaurar')&&hasLocal()&&!S.donors.length&&!S.donations.length&&!S.events.length;
function importLocal(){if(!need('restaurar'))return;ask('Importar datos de este navegador','Se copian a la base compartida los donantes, donaciones y eventos que estaban guardados en este navegador. Los van a ver todos los usuarios.',()=>{try{const j=JSON.parse(localStorage.getItem(KEY));S.donors=j.donors||[];S.donations=j.donations||[];S.events=j.events||[];localStorage.removeItem(KEY);done('Datos importados')}catch(e){toast('No se pudieron importar los datos.')}})}
