/* Sesión: estado de Firebase, usuario actual y permisos por rol (can / need). */
let fb=null,prof=null,users=[],appReady=false,unsubs=[],profUnsub=null,pendingName='',deleting=false,greet=false,appRole='',authMode='login';
const COLS=['donors','donations','events'],shadow=new Map(),loaded={};
const LOGO=(document.querySelector('.brand img')||{}).src||'';
const ROL={admin:'Administrador',editor:'Editor',consulta:'Consulta'};
const me=()=>prof;
const can=a=>{const r=(prof||{}).role;return !!prof&&prof.active===true&&(r=='admin'||(r=='editor'&&(a=='crear'||a=='editar')))};
const need=a=>can(a)||(toast('Tu rol no permite esta acción.'),false);
const hasPw=()=>!!(fb&&fb.auth.currentUser&&fb.auth.currentUser.providerData.some(p=>p.providerId=='password'));
const uref=id=>fb.doc(fb.db,'users',id);
