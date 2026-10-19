/* Pantalla de acceso: iniciar sesión, crear cuenta, Google y recuperar contraseña. */
/* ---- pantalla de acceso ---- */
const aerr=(m,ok)=>{const e=$('#aerr');if(e){e.textContent=m;e.className='aerr'+(ok?' ok':'')}};
function showCard(t,b,mode){document.body.classList.add('locked');$('#auth').innerHTML=`<div class="acard"><div class="alogo">${LOGO?`<img src="${LOGO}" alt="">`:''}<div><b>La Gran Casa</b><small>FUNDACIÓN</small></div></div>${t?`<h1>${t}</h1>`:''}${b}${mode?`<div style="display:flex;gap:8px;margin-top:18px"><button class="btn" onclick="location.reload()">Reintentar</button>${mode==1?'<button class="btn primary" onclick="logout()">Cerrar sesión</button>':''}</div>`:''}</div>`}
const showLoading=m=>showCard('',`<div class="spin"></div><p class="as" style="margin:0;text-align:center">${esc(m)}</p>`,0);
const GSVG='<svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.800 2.400 30.300 0 24 0 14.600 0 6.500 5.400 2.600 13.200l7.900 6.100C12.400 13.600 17.700 9.500 24 9.500z"/><path fill="#4285F4" d="M46.500 24.500c0-1.600-.1-3.100-.4-4.500H24v9h12.700c-.6 3-2.300 5.500-4.800 7.200l7.500 5.800c4.400-4.100 7.100-10.100 7.100-17.500z"/><path fill="#FBBC05" d="M10.500 28.700c-.5-1.400-.8-3-.8-4.700s.3-3.200.8-4.700l-7.900-6.100C.9 16.400 0 20.100 0 24s.9 7.600 2.600 10.800l7.900-6.100z"/><path fill="#34A853" d="M24 48c6.500 0 11.900-2.100 15.900-5.800l-7.500-5.800c-2.100 1.400-4.900 2.300-8.400 2.300-6.300 0-11.600-4.100-13.500-9.800l-7.900 6.100C6.500 42.600 14.600 48 24 48z"/></svg>';
function showAuth(mode,msg){authMode=mode||'login';const su=authMode=='signup';
showCard(su?'Crear cuenta':'Iniciar sesión',`<p class="as">${su?'Completá tus datos para empezar.':'Ingresá para gestionar donantes, donaciones y eventos.'}</p>${su?'<p class="as" style="margin-top:6px">Tu cuenta va a quedar pendiente hasta que un administrador la apruebe. Cuando lo haga, vas a entrar con rol <b>Consulta</b> (solo ver) y un administrador podrá darte más permisos.</p>':''}
<div class="atabs"><button class="${su?'':'on'}" onclick="showAuth('login')">Iniciar sesión</button><button class="${su?'on':''}" onclick="showAuth('signup')">Crear cuenta</button></div>
<div id="aform" onkeydown="if(event.key==='Enter'){event.preventDefault();submitAuth()}">
${su?'<label class="f">Nombre completo<input id="an" autocomplete="name"></label>':''}
<label class="f">Email<input id="ae" type="email" autocomplete="email" placeholder="nombre@email.com"></label>
<label class="f">Contraseña<input id="ap" type="password" autocomplete="${su?'new-password':'current-password'}"${su?' placeholder="Mínimo 6 caracteres"':''}></label>
${su?'<label class="f">Repetir contraseña<input id="ap2" type="password" autocomplete="new-password"></label>':'<button class="lnk" onclick="forgot()">¿Olvidaste tu contraseña?</button>'}
<div class="aerr" id="aerr" role="alert">${esc(msg||'')}</div>
<button class="btn primary big" onclick="submitAuth()">${su?'Crear cuenta':'Iniciar sesión'}</button></div>
<div class="sep"><span>o</span></div><button class="gbtn" onclick="googleLogin()">${GSVG}Continuar con Google</button>`,0)}
function authMsg(e){const c=(e&&e.code)||'';
if(/invalid-credential|wrong-password|user-not-found|invalid-login/.test(c))return'Email o contraseña incorrectos.';
if(c=='auth/email-already-in-use')return'Ya existe una cuenta con ese email. Iniciá sesión o usá "Continuar con Google".';
if(c=='auth/weak-password')return'La contraseña es muy débil (mínimo 6 caracteres).';
if(c=='auth/invalid-email')return'Ingresá un email válido.';
if(c=='auth/too-many-requests')return'Demasiados intentos. Esperá unos minutos o restablecé tu contraseña.';
if(c=='auth/network-request-failed')return'Sin conexión. Revisá tu internet.';
if(c=='auth/operation-not-allowed')return'Este método de acceso todavía no está activado en Firebase (Authentication > Sign-in method).';
if(c=='auth/unauthorized-domain')return'Esta dirección no está autorizada en Firebase (Authentication > Settings > Authorized domains).';
if(c=='auth/popup-blocked')return'El navegador bloqueó la ventana de Google. Permití las ventanas emergentes y probá de nuevo.';
if(c=='auth/operation-not-supported-in-this-environment')return'Google no funciona abriendo el archivo directamente. Abrí la página desde una dirección web (por ejemplo http://localhost:8000).';
if(c=='auth/popup-closed-by-user'||c=='auth/cancelled-popup-request')return'';
if(c=='auth/provider-already-linked')return'Esa cuenta ya tiene contraseña.';
return'No se pudo completar la acción'+(c?' ('+c+')':'')+'.'}
async function submitAuth(){const v=id=>(($('#'+id)||{}).value||'').trim(),email=v('ae').toLowerCase(),pw=($('#ap')||{}).value||'';
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return aerr('Ingresá un email válido.');
try{if(authMode=='signup'){const name=v('an'),pw2=$('#ap2').value;
if(!name)return aerr('Ingresá tu nombre.');
if(pw.length<6)return aerr('La contraseña debe tener al menos 6 caracteres.');
if(pw!==pw2)return aerr('Las contraseñas no coinciden.');
$('.big').disabled=true;pendingName=name;greet=true;await fb.createUserWithEmailAndPassword(fb.auth,email,pw)}
else{if(!pw)return aerr('Ingresá tu contraseña.');$('.big').disabled=true;greet=true;await fb.signInWithEmailAndPassword(fb.auth,email,pw)}}
catch(e){pendingName='';greet=false;const b=$('.big');if(b)b.disabled=false;aerr(authMsg(e))}}
async function googleLogin(){try{greet=true;await fb.signInWithPopup(fb.auth,new fb.GoogleAuthProvider())}catch(e){greet=false;aerr(authMsg(e))}}
async function forgot(){const email=(($('#ae')||{}).value||'').trim().toLowerCase(),OK='Listo. Si ese email tiene una cuenta, te enviamos un enlace para crear una contraseña nueva. Revisá también el correo no deseado.';
if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return aerr('Escribí tu email arriba y volvé a tocar "¿Olvidaste tu contraseña?".');
try{await fb.sendPasswordResetEmail(fb.auth,email);aerr(OK,true)}catch(e){e.code=='auth/user-not-found'?aerr(OK,true):aerr(authMsg(e))}}
