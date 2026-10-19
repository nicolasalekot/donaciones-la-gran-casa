# Donaciones La Gran Casa

Sistema web para gestionar las donaciones de la **Fundación La Gran Casa**: quién dona, cuánto, de qué tipo (diezmo, ofrenda…), los eventos de recaudación y las estadísticas.

Lo usa el equipo que administra las donaciones. No es una página pública: para entrar hace falta una cuenta aprobada por un administrador.

## Qué incluye

- **Inicio:** la primera pantalla al entrar. Título "Fundación La Gran Casa · Sitio web de donaciones" con el logo, y tarjetas de vidrio que llevan a cada sección con datos reales (barras de los últimos meses, donantes, próximo evento, reparto por tipo, total disponible y cuentas pendientes).
- **Panel principal:** resumen del año, total disponible para usar, donantes y ganancia de eventos.
- **Donantes:** afiliados y ocasionales, con historial y un estado que se calcula solo (Al día, Pendiente o Inactivo).
- **Donaciones:** registro con **tipo de donación** (Diezmo, Ofrenda, Ofrenda especial u Otra), filtros y búsqueda.
- **Eventos de recaudación:** metas, ingresos, egresos y entradas vendidas.
- **Estadísticas:** ingresos por mes, por origen, por tipo de donante y por tipo de donación, y los donantes más constantes.
- **Usuarios y roles:** Administrador, Editor y Consulta, con aprobación manual de las cuentas nuevas.
- **Efecto vidrio:** todas las tarjetas, ventanas y la pantalla de ingreso comparten el mismo estilo translúcido (`css/glass.css`). Siempre se entra por **Inicio**.
- **Apariencia:** tema claro u oscuro, y color de acento dorado (por defecto) o celeste.
- **Celular:** menú inferior, listas en forma de tarjetas y formularios a ancho completo (probado desde 320 px hasta tablet).

## Estructura del proyecto

```
.
├── index.html                 Página única: carga los estilos y los scripts
├── css/
│   ├── style.css              Estilos base (estructura y componentes)
│   ├── theme.css              Aspecto actual: tarjetas, botones, luces de fondo
│   ├── accent-celeste.css     Color de acento alternativo (celeste)
│   ├── glass.css              Efecto vidrio compartido por todas las tarjetas y ventanas
│   ├── home.css               Pantalla de Inicio: título, logo y tarjetas de vidrio
│   └── mobile.css             Ajustes para celular y tablet (se carga al final)
├── js/                        Código, un archivo por tema
│   ├── theme-init.js          Aplica el color de acento antes de dibujar la página
│   ├── config.js              Configuración de Firebase
│   ├── utils.js               Formato de texto, dinero y fechas; tipos de donación
│   ├── seed.js                Datos de ejemplo
│   ├── core.js                Estado, navegación, filtros y pantallas de consulta
│   ├── views.js               Panel, estadísticas y resultados de cada consulta
│   ├── home.js                Pantalla de Inicio (la que se ve al entrar)
│   ├── ui-kit.js              Ventanas, selector con buscador y formularios
│   ├── actions.js             Alta, edición y baja de donantes, donaciones y eventos
│   ├── session.js             Sesión y permisos por rol
│   ├── users.js               Gestión de usuarios (administrador)
│   ├── profile.js             Mi perfil
│   ├── auth.js                Pantalla de ingreso y registro
│   ├── sync.js                Sincronización con Firestore y flujo de acceso
│   ├── legacy-import.js       Importación de datos de la versión vieja
│   └── main.js                Arranque
├── img/logo.png               Logo
├── img/logo-3d.png            Logo en 3D de la pantalla Inicio (se corta en el borde derecho)
├── docs/CONTEXTO-PROYECTO.md  Cómo está armado el proyecto, en detalle
├── firestore.rules            Reglas de seguridad de la base de datos
└── README.md                  Este archivo
```

> **El orden de los scripts importa.** Comparten el mismo ámbito global y se cargan en el orden de `index.html`. Si agregás o movés un archivo, respetá ese orden.

## Puesta en marcha (una sola vez)

### 1. Firebase

En [console.firebase.google.com](https://console.firebase.google.com), proyecto `bd-lagrancasa-donaciones`:

1. **Authentication → Sign-in method:** activá *Correo electrónico/contraseña* y *Google*.
2. **Authentication → Settings → Dominios autorizados:** tienen que figurar `localhost` y, cuando la publiques, `nicolasalekot.github.io`.
3. **Firestore Database:** si todavía no existe, *Crear base de datos* (edición Standard, ubicación cercana).
4. **Firestore Database → Reglas:** borrá lo que haya, pegá el contenido de [`firestore.rules`](firestore.rules) y tocá *Publicar*. Hay que volver a publicarlas cada vez que cambie ese archivo.

### 2. Abrirla en tu computadora

Firebase y Google **no funcionan abriendo el archivo con doble clic**: hay que servirla desde una dirección web.

1. Abrí una ventana de comandos dentro de la carpeta del proyecto.
2. Escribí `python -m http.server 8000` (o `py -m http.server 8000`).
3. Abrí `http://localhost:8000` en el navegador y dejá la ventana abierta mientras la uses.

### 3. Primer ingreso

- La **primera cuenta** que se crea queda como **Administrador**. Creala vos antes de compartir la dirección con nadie.
- Las cuentas siguientes quedan **pendientes**: la persona ve un aviso y no entra hasta que un administrador la apruebe desde la pestaña **Usuarios**. Al aprobarla entra con rol *Consulta* y el administrador puede cambiarle el rol.
- La base arranca vacía. Para ver datos de ejemplo: al pie de la página, *Restaurar datos de ejemplo* (solo Administrador; **borra** lo que haya en la base).

## Publicarla en internet (GitHub Pages)

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment*, elegí **Deploy from a branch**, rama `main`, carpeta `/ (root)` y guardá.
3. A los pocos minutos queda en `https://nicolasalekot.github.io/donaciones-la-gran-casa/`.
4. Agregá `nicolasalekot.github.io` en Firebase → Authentication → Settings → Dominios autorizados. Sin eso, el ingreso no funciona en la página publicada.

**Antes de publicar,** asegurate de haber publicado las reglas de [`firestore.rules`](firestore.rules): el registro con aprobación manual depende de ellas.

## Roles

| Rol | Puede |
|---|---|
| **Administrador** | Todo: consultar, crear, editar, eliminar, gestionar usuarios y restaurar datos de ejemplo |
| **Editor** | Consultar, crear y editar. No puede eliminar |
| **Consulta** | Solo ver y filtrar |

Los permisos los hace cumplir Firebase con las reglas, no solo la pantalla.

## Tipos de donación

Al registrar una donación se elige **¿Qué tipo de donación es?**: *Diezmo*, *Ofrenda*, *Ofrenda especial* u *Otra*. Es obligatorio. Las donaciones cargadas antes de existir este campo aparecen como *Sin clasificar*.

El tipo se ve en la tabla de donaciones, se puede usar como filtro y tiene su propio resumen en **Estadísticas**. Hacia afuera se sigue hablando de "donaciones": la división en diezmos y ofrendas queda para el equipo.

## Color de acento

El dorado es el color por defecto. Para probar el celeste: **Mi perfil → Apariencia → Color de acento**. Se guarda solo en ese dispositivo. Los dos colores viven en `css/theme.css` y `css/accent-celeste.css`.

## Seguridad

- La configuración de Firebase en `js/config.js` es **pública por diseño**. Lo que protege los datos son las reglas de `firestore.rules`.
- **Recomendado:** restringí la clave de API para que solo funcione desde tus direcciones. En Google Cloud Console → *APIs y servicios* → *Credenciales* → clave de navegador del proyecto → *Restricciones de aplicación* → *Sitios web*, agregá `https://nicolasalekot.github.io/*`, `http://localhost:8000/*` y `https://bd-lagrancasa-donaciones.firebaseapp.com/*`. Probá el ingreso después de cambiarlo.
- El repositorio es público: el código se ve, los datos no.
- **Nunca subas claves ni tokens** (por ejemplo el de Mercado Pago). El `.gitignore` bloquea los nombres más comunes, pero la regla es no guardarlos en el repositorio.
- No compartas la dirección con quien no deba ver los datos de los donantes. Aunque las cuentas nuevas necesitan aprobación, conviene revisar la lista de usuarios de vez en cuando.

## Sesión

La sesión dura lo que dure la pestaña: al cerrarla se cierra la sesión. Recargar la misma pestaña no la cierra.

## Próximos pasos

- **Carga automática desde Mercado Pago:** una Cloud Function de Firebase que reciba el aviso (webhook) de cada pago y cree la donación. Requiere el plan Blaze de Firebase y las credenciales guardadas como secretos, nunca en el código.

## Más información

[`docs/CONTEXTO-PROYECTO.md`](docs/CONTEXTO-PROYECTO.md) explica el modelo de datos, las reglas de negocio y cómo funciona el código.
