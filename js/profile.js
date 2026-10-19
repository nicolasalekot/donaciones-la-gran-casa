/* Mi perfil: datos personales, foto, tema, color de acento, contraseña y baja de cuenta. */
/* ---- perfil ---- */
function fillChip(u){const i=$('#meI');if(u.photo)i.innerHTML=`<img src="${u.photo}" alt="">`;else i.textContent=ini(u.name);$('#meN').textContent=u.name;$('#meE').textContent=ROL[u.role]+' · '+u.email}
const applyTheme=t=>{const d=document.documentElement;t=='dark'||t=='light'?d.setAttribute('data-theme',t):d.removeAttribute('data-theme');updThm()};
function effTheme(){return document.documentElement.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}
function updThm(){const b=$('#thm');if(!b)return;const d=effTheme()=='dark',a='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">';b.title=d?'Cambiar a tema claro':'Cambiar a tema oscuro';b.innerHTML=d?a+'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>':a+'<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>'}
function toggleTheme(){setTheme(effTheme()=='dark'?'light':'dark')}
function pfMsg(id,m,ok){const e=$('#'+id);if(e){e.textContent=m;e.className='perr'+(ok?' pok':'')}}
function perfilView(){const u=prof;if(!u)return'';const pw=hasPw();
const since=u.created?fd(iso(new Date(u.created))):'';
return head('Mi perfil','Editá tus datos, tu foto y tu contraseña','')+`<div class="pf">
<div class="panel pfc"><div class="pfph">${u.photo?`<img src="${u.photo}" alt="Foto de perfil">`:`<span>${esc(ini(u.name))}</span>`}</div>
<h3 style="padding:0;text-align:center">${esc(u.name)}</h3><p class="pfs">${esc(u.email)}</p><span class="tag ok">${ROL[u.role]}</span>
<input type="file" id="pf" accept="image/*" hidden onchange="pickPhoto(this)">
<div class="pfb"><button class="btn primary" onclick="$('#pf').click()">${u.photo?'Cambiar foto':'Subir foto'}</button>${u.photo?'<button class="btn" onclick="rmPhoto()">Quitar</button>':''}</div>
${since?`<p class="pfs" style="margin-top:14px">Miembro desde ${since}</p>`:''}</div>
<div class="pfr">
<div class="panel" onkeydown="if(event.key==='Enter'&&event.target.tagName==='INPUT'){event.preventDefault();saveProfile()}"><h3>Datos personales</h3><div class="pfg">
<label class="f">Nombre completo<input id="pn" value="${esc(u.name)}" autocomplete="name"></label>
<label class="f">Email<input id="pe" type="email" value="${esc(u.email)}" readonly autocomplete="email"><small class="pfn">Es el email de tu cuenta y no se puede cambiar.</small></label>
<label class="f">Teléfono<input id="pt" type="tel" value="${esc(u.phone||'')}" autocomplete="tel"></label>
<label class="f">Cargo o puesto<input id="pc" value="${esc(u.title||'')}" placeholder="Ej: Tesorera, Voluntario"></label></div>
<div class="perr" id="perr" role="alert"></div><div class="pfa"><button class="btn primary" onclick="saveProfile()">Guardar cambios</button></div></div>
<div class="panel"><h3>Apariencia</h3><div class="pfg"><label class="f">Tema de la página<select onchange="setTheme(this.value)"><option value="" ${!u.theme?'selected':''}>Automático (según tu dispositivo)</option><option value="light" ${u.theme=='light'?'selected':''}>Claro</option><option value="dark" ${u.theme=='dark'?'selected':''}>Oscuro</option></select></label>
<label class="f">Color de acento<select onchange="setAccent(this.value)"><option value="" ${accentNow()==''?'selected':''}>Dorado</option><option value="celeste" ${accentNow()=='celeste'?'selected':''}>Celeste</option></select><small class="pfn">Se guarda solo en este dispositivo.</small></label></div></div>
<div class="panel" onkeydown="if(event.key==='Enter'&&event.target.tagName==='INPUT'){event.preventDefault();changePass()}"><h3>${pw?'Cambiar contraseña':'Crear contraseña'}</h3>
${pw?'':'<p class="pfs" style="text-align:left;padding-top:4px">Tu cuenta entra con Google. Creá una contraseña si también querés entrar con tu email.</p>'}
<div class="pfg">${pw?'<label class="f w">Contraseña actual<input id="pw0" type="password" autocomplete="current-password"></label>':''}
<label class="f">Nueva contraseña<input id="pw1" type="password" autocomplete="new-password" placeholder="Mínimo 6 caracteres"></label>
<label class="f">Repetir nueva contraseña<input id="pw2" type="password" autocomplete="new-password"></label></div>
<div class="perr" id="pwerr" role="alert"></div><div class="pfa"><button class="btn primary" onclick="changePass()">${pw?'Actualizar contraseña':'Crear contraseña'}</button></div></div>
<div class="panel"><h3>Eliminar cuenta</h3><p class="pfs" style="text-align:left;padding:4px 0 10px">Se elimina tu usuario. Los donantes, donaciones y eventos cargados no se borran.</p><div class="perr" id="delerr" role="alert"></div><div class="pfa"><button class="btn" style="color:var(--red)" onclick="delAccount()">Eliminar mi cuenta</button></div></div>
</div></div>`}
async function saveProfile(){const v=id=>(($('#'+id)||{}).value||'').trim(),name=v('pn');
if(!name)return pfMsg('perr','Ingresá tu nombre.');
try{const d={name,phone:v('pt'),title:v('pc')};await fb.updateDoc(uref(prof.id),d);Object.assign(prof,d);fillChip(prof);toast('Perfil actualizado');render()}catch(e){pfMsg('perr','No se pudo guardar. Revisá tu conexión.')}}
function pickPhoto(inp){const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
if(!/^image\//.test(f.type))return toast('Elegí un archivo de imagen.');
if(f.size>10*1024*1024)return toast('La imagen es muy pesada (máximo 10 MB).');
const r=new FileReader();r.onerror=()=>toast('No se pudo leer la imagen.');
r.onload=()=>{const im=new Image();im.onerror=()=>toast('No se pudo abrir esa imagen. Probá con JPG o PNG.');
im.onload=()=>{const N=256,c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),m=Math.min(im.width,im.height);x.fillStyle='#fff';x.fillRect(0,0,N,N);x.drawImage(im,(im.width-m)/2,(im.height-m)/2,m,m,0,0,N,N);
const ph=c.toDataURL('image/jpeg',.86);fb.updateDoc(uref(prof.id),{photo:ph}).then(()=>{prof.photo=ph;fillChip(prof);toast('Foto actualizada');render()}).catch(()=>toast('No se pudo guardar la foto.'))};im.src=r.result};r.readAsDataURL(f)}
function rmPhoto(){fb.updateDoc(uref(prof.id),{photo:fb.deleteField()}).then(()=>{delete prof.photo;fillChip(prof);toast('Foto quitada');render()}).catch(()=>toast('No se pudo quitar la foto.'))}
function setTheme(t){applyTheme(t);prof.theme=t;fb.updateDoc(uref(prof.id),{theme:t}).catch(()=>toast('No se pudo guardar el tema.'))}
const AUTHERR='Por seguridad, cerrá sesión, volvé a entrar y probá de nuevo.';
async function changePass(){const user=fb.auth.currentUser,had=hasPw(),g=id=>($('#'+id)||{}).value||'',old=g('pw0'),n1=g('pw1'),n2=g('pw2');
if(had&&!old)return pfMsg('pwerr','Ingresá tu contraseña actual.');
if(n1.length<6)return pfMsg('pwerr','La nueva contraseña debe tener al menos 6 caracteres.');
if(n1!==n2)return pfMsg('pwerr','Las contraseñas nuevas no coinciden.');
if(had&&n1===old)return pfMsg('pwerr','La nueva contraseña debe ser distinta de la actual.');
try{if(had){try{await fb.reauthenticateWithCredential(user,fb.EmailAuthProvider.credential(user.email,old))}catch(e){return pfMsg('pwerr',/too-many/.test(e.code||'')?authMsg(e):'La contraseña actual no es correcta.')}await fb.updatePassword(user,n1)}
else await fb.linkWithCredential(user,fb.EmailAuthProvider.credential(user.email,n1));
toast(had?'Contraseña actualizada':'Contraseña creada');render()}catch(e){pfMsg('pwerr',e.code=='auth/requires-recent-login'?AUTHERR:authMsg(e))}}
const askPass=msg=>new Promise(res=>{modal('Confirmá tu identidad',`<div class="mb"><p style="margin:8px 0 14px;font-size:17.5px;line-height:1.5">${msg}</p><label class="f">Contraseña<input id="rp" type="password" autocomplete="current-password"></label><div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px"><button class="btn" id="rpc">Cancelar</button><button class="btn primary" id="rpo">Continuar</button></div></div>`);let d=false;const fin=v=>{if(d)return;d=true;M.removeEventListener('close',onc);if(M.open)closeM();res(v)},onc=()=>fin(null);M.addEventListener('close',onc);$('#rpc').onclick=()=>fin(null);$('#rpo').onclick=()=>fin($('#rp').value||null)});
async function reauth(){const u=fb.auth.currentUser;if(hasPw()){const pw=await askPass('Por seguridad, ingresá tu contraseña actual para continuar.');if(pw==null)return false;await fb.reauthenticateWithCredential(u,fb.EmailAuthProvider.credential(u.email,pw));return true}await fb.reauthenticateWithPopup(u,new fb.GoogleAuthProvider());return true}
function delAccount(){const u=prof;
if(u.role=='admin'&&!users.some(x=>x.id!==u.id&&x.role=='admin'&&x.active===true))return pfMsg('delerr','Sos la única persona administradora. Dale el rol de Administrador a otra persona antes de eliminar tu cuenta.');
ask('Eliminar mi cuenta','¿Seguro que querés eliminar tu cuenta? Los datos de donantes, donaciones y eventos no se borran.',async()=>{try{if(!await reauth())return;deleting=true;await fb.deleteDoc(uref(u.id));await fb.deleteUser(fb.auth.currentUser);toast('Tu cuenta fue eliminada')}catch(e){const c=(e&&e.code)||'';toast(/wrong-password|invalid-credential/.test(c)?'La contraseña no es correcta.':/popup-closed|cancelled/.test(c)?'Se canceló la verificación.':'No se pudo eliminar la cuenta. Cerrá sesión, volvé a entrar y repetí.')}finally{deleting=false}})}
/* Color de acento: se guarda en este dispositivo (localStorage) y se aplica con data-accent (ver theme-init.js). */
const accentNow=()=>document.documentElement.getAttribute('data-accent')||'';
function setAccent(a){const d=document.documentElement;a==='celeste'?d.setAttribute('data-accent','celeste'):d.removeAttribute('data-accent');try{a?localStorage.setItem('lgc-accent',a):localStorage.removeItem('lgc-accent')}catch(e){}toast('Color actualizado')}
