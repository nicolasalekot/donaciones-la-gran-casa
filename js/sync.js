/* Sincronización con Firestore, alta de perfil y flujo de acceso (Firebase Auth). */
/* ---- sincronización con Firestore ---- */
const cj=o=>JSON.stringify(o,Object.keys(o).filter(k=>o[k]!==undefined).sort());
function reconcile(c,docs){for(const k of [...shadow.keys()])if(k.startsWith(c+'/'))shadow.delete(k);
const old=new Map(S[c].map(x=>[x.id,x]));
S[c]=docs.map(d=>{shadow.set(c+'/'+d.id,cj(d));const o=old.get(d.id);if(!o)return d;Object.keys(o).forEach(k=>{if(!(k in d))delete o[k]});Object.assign(o,d);return o});if(c=='donors')S.donors.forEach(d=>{if(d.status=='Incompleto'){d.status='Pendiente';migr=true}})}
function fbSave(){if(!fb||!prof||!appReady)return;const ops=[],seen=new Set();
for(const c of COLS)for(const it of S[c]){if(!it.id)continue;const key=c+'/'+it.id,j=cj(it);seen.add(key);if(shadow.get(key)!==j){ops.push(['set',c,it.id,JSON.parse(j)]);shadow.set(key,j)}}
for(const key of [...shadow.keys()])if(!seen.has(key)){const[c,id]=key.split('/');ops.push(['del',c,id]);shadow.delete(key)}
for(let i=0;i<ops.length;i+=400){const b=fb.writeBatch(fb.db);ops.slice(i,i+400).forEach(o=>o[0]=='set'?b.set(fb.doc(fb.db,o[1],o[2]),o[3]):b.delete(fb.doc(fb.db,o[1],o[2])));
b.commit().catch(e=>toast(/permission/.test((e&&e.code)||'')?'Tu rol no permite guardar este cambio.':'No se pudo guardar. Revisá tu conexión.'))}}
function softRender(){if(!appReady||M.open||ui.mode=='filtros'||cur()=='perfil')return;render()}
function stopData(){unsubs.forEach(f=>{try{f()}catch(e){}});unsubs=[];appReady=false;appRole='';S={donors:[],donations:[],events:[]};shadow.clear();for(const k in loaded)delete loaded[k]}
function teardown(){stopData();if(profUnsub){profUnsub();profUnsub=null}prof=null;users=[];applyTheme('')}
function startData(){appRole=prof.role;showLoading('Cargando datos…');
COLS.forEach(c=>unsubs.push(fb.onSnapshot(fb.collection(fb.db,c),snap=>{reconcile(c,snap.docs.map(d=>({...d.data(),id:d.id})));loaded[c]=1;dataTick()},authFail)));
if(prof.role=='admin')unsubs.push(fb.onSnapshot(fb.collection(fb.db,'users'),snap=>{users=snap.docs.map(d=>({...d.data(),id:d.id}));softRender()},authFail))}
function dataTick(){if(!appReady){if(COLS.every(c=>loaded[c])){appReady=true;enterApp()}}else softRender();if(migr&&appReady&&can('editar')){migr=false;save()}}
function enterApp(){document.body.classList.remove('locked');$('#auth').innerHTML='';fillChip(prof);applyTheme(prof.theme);/* siempre se entra por Inicio, aunque la dirección traiga otra pestaña */try{history.replaceState(null,'',location.pathname+location.search+'#inicio')}catch(e){location.hash='#inicio'}reset();render();scrollTo(0,0);if(greet){toast('¡Hola, '+prof.name.split(/\s+/)[0]+'!');greet=false}}
function showBlocked(){const p=prof.pending;showCard(p?'Cuenta pendiente de aprobación':'Cuenta desactivada',`<p class="as">${p?'Tu cuenta fue creada. Un administrador tiene que aprobarla para que puedas entrar. Cuando lo haga, esta pantalla pasa sola a la página.':'Tu cuenta está desactivada. Consultá con un administrador.'}</p><p class="as">${esc(prof.email)}</p>`,1)}
function authFail(e){if(deleting)return;/* al eliminar la cuenta es normal que las lecturas dejen de tener permiso */const c=(e&&e.code)||'';let m='No se pudo conectar con la base de datos.';
if(/permission/.test(c))m='No hay permiso para leer los datos. Puede que las reglas de seguridad de Firestore todavía no estén publicadas (ver LEEME.txt).';
else if(c=='profile-missing')m='No se encontró tu perfil de usuario. Cerrá sesión y volvé a entrar.';
else if(/unavailable|network/.test(c))m='Sin conexión con Firebase. Revisá tu internet.';
stopData();showCard('Algo salió mal',`<p class="as">${esc(m)}</p><p class="as" style="font-size:13.8px">${esc(c)}</p>`,1)}
async function ensureProfile(u){const ref=uref(u.uid);if((await fb.getDoc(ref)).exists())return;
const name=(pendingName||u.displayName||(u.email||'').split('@')[0]).trim();pendingName='';
const base={name,email:(u.email||'').toLowerCase(),via:u.providerData.some(p=>p.providerId=='google.com')?'google':'email',created:Date.now()};
let first=false;try{first=!(await fb.getDoc(fb.doc(fb.db,'meta','admin'))).exists()}catch(e){}
if(first){try{const b=fb.writeBatch(fb.db);b.set(ref,{...base,role:'admin',active:true,pending:false});b.set(fb.doc(fb.db,'meta','admin'),{uid:u.uid});await b.commit();return}catch(e){}}
/* Cuentas nuevas: quedan PENDIENTES hasta que un administrador las apruebe (firestore.rules lo exige). */
await fb.setDoc(ref,{...base,role:'consulta',active:false,pending:true})}
function onProfile(){if(prof.active!==true){stopData();showBlocked();return}
if(unsubs.length&&appRole===prof.role){if(appReady){fillChip(prof);applyTheme(prof.theme);softRender()}return}
stopData();startData()}
function watchProfile(u){if(profUnsub)profUnsub();profUnsub=fb.onSnapshot(uref(u.uid),snap=>{if(!snap.exists()){if(deleting)return;prof=null;return authFail({code:'profile-missing'})}prof={...snap.data(),id:snap.id};onProfile()},authFail)}
function startAuth(){fb.onAuthStateChanged(fb.auth,async u=>{if(!u){teardown();showAuth('login');return}showLoading('Entrando…');try{await ensureProfile(u);watchProfile(u)}catch(e){authFail(e)}})}
function logout(){if(fb&&fb.auth.currentUser)fb.signOut(fb.auth);else showAuth('login')}
