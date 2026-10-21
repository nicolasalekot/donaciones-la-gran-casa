/* Configuración de Firebase. Estos datos son públicos por diseño: la seguridad la dan las reglas de Firestore (firestore.rules). */
const firebaseConfig={apiKey:"AIzaSyAaxW-9VQh5FbTI6uw69FDKH3auHs79Mmw",authDomain:"bd-lagrancasa-donaciones.firebaseapp.com",projectId:"bd-lagrancasa-donaciones",storageBucket:"bd-lagrancasa-donaciones.firebasestorage.app",messagingSenderId:"455098771817",appId:"1:455098771817:web:1b60ff8c858025fd6735f8",measurementId:"G-JRPH99CWZF"};
const FB_VER='12.13.0',FBU=n=>`https://www.gstatic.com/firebasejs/${FB_VER}/firebase-${n}.js`;

/* App Check (protección contra bots y usos fuera de la página).
   Pegá acá la "clave del sitio" de reCAPTCHA v3 que registraste en Firebase > App Check.
   Es pública (no es un secreto). Mientras esté vacía, App Check queda apagado y todo funciona como siempre. */
const APPCHECK_SITE_KEY='';
