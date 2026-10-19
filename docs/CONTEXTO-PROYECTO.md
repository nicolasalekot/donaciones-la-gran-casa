# Contexto del proyecto — La Gran Casa · Gestión de donaciones

Este documento explica cómo está armado el proyecto, para poder retomarlo (vos, otra persona del equipo o una herramienta como Claude) sin tener que descifrar el código. Para instalarlo y publicarlo, mirá el [README](../README.md).

## 1. Qué es

Aplicación web **interna** para el equipo que gestiona las donaciones de la Fundación La Gran Casa (que también es una iglesia). No es una página pública: hay que iniciar sesión con una cuenta aprobada.

Permite llevar el registro de:

- **Donantes** (afiliados y ocasionales)
- **Donaciones** recibidas, clasificadas por tipo (diezmo, ofrenda, ofrenda especial u otra)
- **Eventos** de recaudación (ingresos, egresos, metas)
- **Estadísticas** (ingresos por mes, por origen, por tipo de donante y por tipo de donación; donantes más constantes)
- **Usuarios** del equipo, con roles, permisos y aprobación manual

Idioma de la interfaz: español de Argentina, con voseo ("Ingresá", "Elegí", "Tocá").

## 2. Tecnología

| Parte | Qué se usa |
|---|---|
| Front-end | HTML + CSS + JavaScript puro, sin frameworks ni paso de compilación |
| Base de datos | Firebase **Firestore** (en tiempo real, compartida entre usuarios) |
| Acceso | Firebase **Authentication** (email/contraseña y Google) |
| Firebase SDK | v12.13.0, cargado desde `gstatic.com` con `import()` dinámico |
| Tipografía | Poppins (Google Fonts) |
| Publicación | GitHub Pages, desde la rama `main` |
| Proyecto Firebase | `bd-lagrancasa-donaciones` |

La configuración de Firebase (`js/config.js`) es **pública por diseño**: no es un secreto. Lo que protege los datos son las reglas de `firestore.rules`.

**Los secretos reales** (por ejemplo el Access Token de Mercado Pago) nunca van en el código ni en el repositorio.

## 3. Archivos

```
index.html                 Página única: carga estilos y scripts
css/style.css              Estilos base: estructura y componentes
css/theme.css              Aspecto actual (capa encima de style.css)
css/accent-celeste.css     Color de acento alternativo
js/theme-init.js           Aplica el color de acento antes de dibujar (evita parpadeo)
js/config.js               firebaseConfig
js/utils.js                Helpers, fechas en hora local, tipos de donación (KINDS, kindOf)
js/seed.js                 Datos de ejemplo
js/core.js                 Estado (S), navegación, filtros, pantallas de consulta
js/views.js                VIEW (panel, estadísticas…) y RES (resultados de consultas)
js/ui-kit.js               Modales, confirmaciones, selector con buscador, formularios
js/actions.js              CRUD de donantes, donaciones y eventos; render()
js/session.js              Estado de sesión y permisos (can / need)
js/users.js                Pantalla de usuarios (administrador)
js/profile.js              Mi perfil, tema, color de acento, contraseña, baja de cuenta
js/auth.js                 Pantalla de ingreso y registro
js/sync.js                 Sincronización con Firestore, ensureProfile, flujo de acceso
js/legacy-import.js        Importación de datos de la versión que guardaba en el navegador
js/main.js                 Arranque (boot)
img/logo.png               Logo
firestore.rules            Reglas de seguridad
```

**Orden de carga.** Los scripts son clásicos (no módulos) y comparten el mismo ámbito global, igual que cuando todo estaba en un solo archivo. Se cargan en el orden de `index.html` y ese orden importa: el código que se ejecuta al cargar (por ejemplo `reset()` o `const M=$('#m')`) depende de lo definido antes.

## 4. Modelo de datos (Firestore)

### `donors` — donantes
| Campo | Detalle |
|---|---|
| `id` | identificador del documento |
| `name`, `email`, `phone` | datos de contacto |
| `type` | `Afiliado` u `Ocasional` |
| `status` | `Al día`, `Pendiente` o `Inactivo` (**se calcula solo**, ver sección 5) |
| `base` | monto histórico previo al uso de la app (número) |
| `last` | fecha histórica de la última donación previa a la app (`AAAA-MM-DD`) |

### `donations` — donaciones
| Campo | Detalle |
|---|---|
| `id` | identificador |
| `date` | fecha `AAAA-MM-DD` |
| `donorId` | id del donante, o `null` si es anónima |
| `who` | texto con el nombre cuando no hay `donorId` (por ejemplo "Rifa solidaria") |
| `concept` | descripción |
| `origin` | `Donación` o `Evento` |
| `kind` | **tipo de donación:** `Diezmo`, `Ofrenda`, `Ofrenda especial` u `Otra`. Si falta (donaciones anteriores), se muestra como `Sin clasificar` |
| `eventId` | id del evento, si el origen es Evento |
| `amount` | monto en pesos (número) |

### `events` — eventos
| Campo | Detalle |
|---|---|
| `id`, `name`, `place`, `date` | datos básicos |
| `status` | `Próximo` o `Finalizado` |
| `ing` / `egr` | ingresos y egresos acumulados |
| `goal` | meta de recaudación |
| `sold` / `cap` | entradas vendidas y entradas totales |

### `users` — usuarios (el id del documento es el `uid` de Firebase Auth)
| Campo | Detalle |
|---|---|
| `name`, `email` | datos de la cuenta (el email no se puede cambiar) |
| `via` | `google` o `email` |
| `created` | fecha de creación en milisegundos |
| `role` | `admin`, `editor` o `consulta` |
| `active`, `pending` | estado de la cuenta (ver sección 6) |
| `phone`, `title`, `theme` | perfil (teléfono, cargo, tema `light`/`dark`/vacío) |
| `photo` | foto de perfil como imagen JPEG de 256×256 guardada en el propio documento |

### `meta/admin`
Documento `{ uid }` que indica que ya existe un administrador. Se crea junto con la primera cuenta y no se puede modificar.

## 5. Reglas de negocio importantes

- **Estado del donante, automático.** Según su última donación: hasta 40 días → *Al día*; hasta 90 días → *Pendiente*; más → *Inactivo*. Sin ninguna donación → *Pendiente*. Se recalcula cada vez que se dibuja la pantalla.
- **Total donado de un donante** = `base` + suma de sus donaciones.
- **Total disponible para usar** = total de todas las donaciones − las donaciones con origen *Evento* (esas se miden aparte en la ganancia neta de cada evento).
- **Donación con origen Evento:** al registrarla se suma a los ingresos (`ing`) del evento; al eliminarla se resta.
- **Tipo de donación obligatorio** al registrar una donación nueva. Para las de origen Evento se elige *Otra* si no corresponde diezmo ni ofrenda.
- **Eliminar un donante** no borra sus donaciones: quedan en el historial con su nombre guardado en `who`.
- **Dinero:** formato `es-AR`, con `$` y sin decimales. **Fechas:** se guardan como `AAAA-MM-DD` y se muestran `DD/MM/AAAA`. "Hoy" se calcula en **hora local** (función `iso`), no en UTC.

## 6. Roles, permisos y cuentas nuevas

| Rol | Puede |
|---|---|
| `admin` | todo: consultar, crear, editar, eliminar, gestionar usuarios, restaurar datos de ejemplo |
| `editor` | consultar, crear y editar. No eliminar |
| `consulta` | solo ver y filtrar |

Se aplican en **dos lugares**: en la pantalla (`can()` oculta botones) y, lo importante, en `firestore.rules`. Si se cambia un permiso, hay que cambiarlo en los dos.

- La **primera cuenta** que se crea queda como administrador, activa.
- Las **cuentas nuevas** se crean con rol `consulta`, `active: false` y `pending: true`. La persona ve la pantalla "Cuenta pendiente de aprobación" y no puede leer datos. Un administrador la aprueba desde **Usuarios** (`toggleUser`), lo que pone `active: true` y `pending: false`. Las reglas exigen ese estado inicial.
- Mientras haya cuentas pendientes, la pestaña **Usuarios** muestra el número entre paréntesis.
- Un administrador no puede eliminar su cuenta si es el único. Esa verificación se hace solo en la pantalla, no en las reglas.

## 7. Cómo funciona el código

**Flujo de acceso:** `onAuthStateChanged` → `ensureProfile` (crea el perfil si no existe) → `watchProfile` (escucha el perfil en vivo) → `onProfile` → `startData` (escucha las colecciones) → `enterApp`.

**Sincronización:** el estado vive en el objeto `S` (`donors`, `donations`, `events`). `save()` llama a `fbSave()`, que compara cada documento contra una copia (`shadow`) y escribe solo lo que cambió, en lotes de 400. Los cambios de otros usuarios llegan por `onSnapshot` y se integran con `reconcile()`.

**Pantallas:** se navega con el hash de la URL (`#panel`, `#donantes`, `#donaciones`, `#eventos`, `#estadisticas`, `#usuarios`, `#perfil`). El objeto `VIEW` dibuja cada pantalla; `RES` dibuja los resultados de las consultas con filtros; `ui` guarda el modo (`home`, `filtros`, `resultados`) y los filtros activos.

**Tema y color:** los colores son variables CSS. El modo oscuro sigue al dispositivo (`prefers-color-scheme`) o a la preferencia guardada en el perfil (atributo `data-theme`). El color de acento (`--gold`, `--gold-soft`, `--gold-ink`, `--gold-rgb`) es dorado por defecto; `css/accent-celeste.css` lo cambia a celeste cuando `<html>` tiene `data-accent="celeste"`. Ese valor se guarda en `localStorage` (`lgc-accent`) y lo aplica `js/theme-init.js` antes de dibujar. Se elige en *Mi perfil → Apariencia*.

**Logo:** `img/logo.png`. Se reutiliza en la pantalla de acceso, la marca de agua, el ícono para iPhone y el manifiesto de la app instalable; estos dos últimos se generan al cargar.

**Sesión:** dura lo que dure la pestaña (`browserSessionPersistence`).

## 8. Puntos a tener presentes

1. **Clave de API de Firebase.** Es pública, pero conviene restringirla a las direcciones del sitio (ver README → Seguridad).
2. **Foto en el documento.** La foto de perfil se guarda dentro del documento del usuario. Funciona bien con fotos de 256 px, pero no escalaría a imágenes grandes.
3. **Datos de ejemplo.** `seed()` carga datos ficticios con el botón "Restaurar datos de ejemplo" (solo admin). Borra todo lo que haya.
4. **Scripts globales.** Al no usar módulos, todos los nombres de nivel superior comparten ámbito: dos archivos no pueden declarar el mismo `const`.
5. **Último administrador.** La protección de "no eliminar al único administrador" vive solo en la pantalla.

## 9. Trabajo planeado

1. **Carga automática desde Mercado Pago:** una Cloud Function de Firebase recibe el aviso (webhook) de cada pago, lo asocia a un donante por email (o lo deja anónimo) y crea la donación con su tipo. Requiere el plan Blaze de Firebase y guardar las credenciales como secretos. Falta confirmar si las transferencias directas al alias también generan aviso.
2. Decidir si se agrega una pantalla pública de donación (con explicación de cada tipo para quien no conoce los términos).

## 10. Convenciones para seguir trabajando

- Textos en español rioplatense, con voseo.
- No guardar claves ni tokens en el código ni en el repositorio.
- Todo cambio de permisos se hace en `js/session.js` **y** en `firestore.rules`.
- Después de cambiar `firestore.rules`, publicarlas en Firebase Console → Firestore Database → Reglas.
- Si se agrega un archivo en `js/`, sumarlo a `index.html` en el lugar correcto del orden de carga.
