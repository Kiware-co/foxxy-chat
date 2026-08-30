# Foxxy Chat — fork de marca de Chatwoot

Este repositorio es un fork de [`chatwoot/chatwoot`](https://github.com/chatwoot/chatwoot)
con la identidad visual de **Foxxy** (naranja + zorro) aplicada al panel de agentes.

- **Upstream:** `chatwoot/chatwoot`
- **Version base:** tag **`v4.17.1`** (Community Edition, sin `enterprise/`)
- **Rama de trabajo:** `foxxy-main` (parches Foxxy aplicados encima del tag)
- **Imagen resultante:** `localhost:5000/kiware-co/foxxy-chat:v4.17.1-foxxy.1`
  (sustituye a `localhost:5000/kiware-co/chatwoot:v4.17.1-ce`)

Chatwoot es software MIT (salvo el directorio `enterprise/`, que tiene licencia
comercial propia). Este fork **no elimina ni altera** `LICENSE` ni
`enterprise/LICENSE`, y el aviso de copyright de Chatwoot Inc. se conserva
intacto. La imagen se construye en modo **CE**, borrando `enterprise/` antes del
`docker build`, exactamente como hace el workflow oficial de Chatwoot.

---

## 1. Por que hace falta un fork

El branding **textual y de logos** de Chatwoot (nombre de la instalacion, LOGO,
LOGO_DARK, LOGO_THUMBNAIL, favicon del navegador via `LOGO_THUMBNAIL`) es
configurable en runtime desde la tabla `installation_configs`, y en produccion
**ya esta resuelto por ahi**. Eso no requiere fork y este fork no lo toca.

Lo que **si** requiere tocar el codigo:

1. **La paleta de color.** Chatwoot CE no expone ninguna opcion de CSS
   personalizado (no existe `custom_css` ni `CUSTOM_CSS` en el codigo). El azul
   de marca esta compilado dentro del bundle de Tailwind/Vite.
2. **Los iconos estaticos de `public/`.** El layout `vueapp.html.erb` referencia
   ~14 ficheros PNG por ruta fija (`/apple-icon-*.png`, `/android-icon-*.png`,
   `/favicon-*.png`) y el `manifest.json` de la PWA. No hay configuracion que los
   redirija.

---

## 2. Paleta Foxxy

Color de marca: **`#f2790e`** (el `--color-focus` de foxxy.pro).

La regla que se ha seguido, y que conviene mantener en futuros rebases:

> **Donde Chatwoot usaba su hex de marca literal (`#2781F6`), va `#f2790e`.
> Donde Chatwoot usaba un paso de una escala generada, va el paso equivalente de
> la escala `orange` / `orangeDark` de Radix.**

Asi se preserva el ramp de luminancia original (y por tanto los contrastes y el
comportamiento en modo oscuro) sin inventar una escala nueva.

### 2.1 Escala `woot` (`theme/colors.js`)

Es la escala de marca del sistema de diseno "legacy" (~200 ficheros la usan via
`bg-woot-*`, `text-woot-*`, ...). Se ha cambiado el **origen** de `blue`/`blueDark`
a `orange`/`orangeDark` de `@radix-ui/colors`, **manteniendo el mismo mapeo de
pasos**:

| token      | origen Radix        | antes (azul) | ahora (naranja) |
| ---------- | ------------------- | ------------ | --------------- |
| `woot-25`  | `orange.orange2`    | `#f4faff`    | `#fff7ed`       |
| `woot-50`  | `orange.orange3`    | `#e6f4fe`    | `#ffefd6`       |
| `woot-75`  | `orange.orange4`    | `#d5efff`    | `#ffdfb5`       |
| `woot-100` | `orange.orange5`    | `#c2e5ff`    | `#ffd19a`       |
| `woot-200` | `orange.orange7`    | `#8ec8f6`    | `#f5ae73`       |
| `woot-300` | `orange.orange8`    | `#5eb1ef`    | `#ec9455`       |
| `woot-400` | `orangeDark.orange11` | `#70b8ff`  | `#ffa057`       |
| `woot-500` | `orangeDark.orange10` | `#3b9eff`  | `#ff801f`       |
| `woot-600` | `orangeDark.orange9`  | `#0090ff`  | `#f76b15`       |
| `woot-700` | `orangeDark.orange8`  | `#2870bd`  | `#a35829`       |
| `woot-800` | `orangeDark.orange6`  | `#104d87`  | `#66350c`       |
| `woot-900` | `orangeDark.orange2`  | `#111927`  | `#1e160f`       |

### 2.2 Escala de acento del design system "next" (`_next-colors.scss`)

El sistema nuevo (`n-brand`, `n-blue-*`, `n-solid-blue`, ...) no usa Radix: define
sus propias variables CSS. La escala `--blue-*` **es** la escala de acento de
marca de Chatwoot (su paso 9 era literalmente `#2781F6`), no un color semantico
de "informacion". Se ha retintado a naranja:

| var          | light (antes → ahora)          | dark (antes → ahora)           |
| ------------ | ------------------------------ | ------------------------------ |
| `--blue-1`   | `#fbfdff` → `#fefcfb`          | `#0a111c` → `#17120e`          |
| `--blue-2`   | `#f5f9ff` → `#fff7ed`          | `#0f1826` → `#1e160f`          |
| `--blue-3`   | `#e9f3ff` → `#ffefd6`          | `#0f2748` → `#331e0b`          |
| `--blue-4`   | `#daecff` → `#ffdfb5`          | `#0a3163` → `#462100`          |
| `--blue-5`   | `#c9e2ff` → `#ffd19a`          | `#123d75` → `#562800`          |
| `--blue-6`   | `#b5d5ff` → `#ffc182`          | `#1d5486` → `#66350c`          |
| `--blue-7`   | `#9bc3fc` → `#f5ae73`          | `#28599c` → `#7e451d`          |
| `--blue-8`   | `#75abf7` → `#ec9455`          | `#306aba` → `#a35829`          |
| `--blue-9`   | `#2781f6` → **`#f2790e`**      | `#2781f6` → **`#f2790e`**      |
| `--blue-10`  | `#1073e9` → `#ef5f00`          | `#1574e7` → `#ff801f`          |
| `--blue-11`  | `#086de0` → `#cc4e00`          | `#7eb6ff` → `#ffa057`          |
| `--blue-12`  | `#0b3265` → `#582d1d`          | `#cde3ff` → `#ffe0c2`          |

Tokens derivados (`--text-blue`, `--border-blue-strong`, `--solid-blue`,
`--solid-blue-2`, `--border-blue`) se han recalculado: los que coincidian
exactamente con un paso de la escala usan el paso naranja equivalente; los que
caian fuera de la escala se han rotado de tono en **OKLCh manteniendo la
luminancia L original** (y recortando el croma al gamut sRGB), de forma que el
contraste con su fondo se conserva.

`n.brand` en `theme/colors.js` pasa de `#2781F6` a `#f2790e`. Es el color del
boton primario (`bg-n-brand`), asi que es el cambio mas visible de todos.

**Lo que NO se ha tocado, a proposito:** los colores semanticos (`green` de
exito, `red` de error, `yellow`/`amber` de aviso, `slate`/`gray` de superficie,
`violet`, `teal`, `ruby`, `iris`).

### 2.3 Nota de contraste

`#f2790e` sobre blanco da 2.79:1; el azul original `#2781F6` daba 3.78:1. Es una
perdida real y viene impuesta por la marca (un naranja saturado no puede dar mas
contraste con blanco). Afecta a texto blanco sobre boton primario. Si en algun
momento molesta, la palanca es subir `n.brand` y `--blue-9` a un naranja mas
oscuro (p.ej. `#cc4e00`, que da 4.6:1) sin tocar el resto de la escala.

---

## 3. Ficheros modificados respecto a `v4.17.1`

| fichero | por que |
| --- | --- |
| `theme/colors.js` | Escala `woot` (`blue`/`blueDark` → `orange`/`orangeDark` de Radix) y `n.brand` (`#2781F6` → `#f2790e`). Es el punto de cambio principal: `tailwind.config.js` importa de aqui. |
| `app/javascript/dashboard/assets/scss/_next-colors.scss` | Escala `--blue-1..12` (light + dark) y tokens derivados retintados a naranja. |
| `app/javascript/dashboard/assets/scss/super_admin/index.scss` | Mismos tokens (`--text-blue`, `--solid-blue`, `--border-blue`): el panel de super admin tiene su propia copia de las variables. |
| `app/javascript/widget/assets/scss/woot.scss` | Idem: el widget embebido tiene su tercera copia de esos tokens. |
| `app/javascript/dashboard/modules/widget-preview/components/Widget.vue` | Idem: la vista previa del widget tiene una cuarta copia. |
| `app/javascript/dashboard/routes/dashboard/commands/commandbar.vue` | `--ninja-accent-color` de la paleta de comandos (Cmd+K). |
| `app/javascript/dashboard/components-next/message/MessageStatus.vue` | Tick de "leido": tenia `text-[#7EB6FF]` (el `--blue-11` oscuro) escrito a mano. |
| `app/javascript/sdk/sdk.css` | Fondo por defecto de la burbuja lanzadora del widget embebido (`.woot-widget-bubble`), antes de que el JS aplique el color del inbox. Es codigo que se sirve en la web del cliente. |
| `app/javascript/dashboard/routes/dashboard/settings/inbox/channels/Website.vue` | Color preseleccionado al crear un inbox de tipo web (`#009CE0`, un tercer azul distinto). |
| `app/javascript/dashboard/components/widgets/WootWriter/AudioRecorder.vue` | Color de la onda del grabador de audio. |
| `app/javascript/superadmin_pages/views/dashboard/Index.vue` | Color de la grafica del dashboard de super admin. |
| `app/views/super_admin/application/_icons.html.erb` | Icono SVG con `fill` azul. |
| `app/assets/stylesheets/administrate/utilities/_variables.scss` | `$color-woot`, el color de marca del panel administrate. |
| `app/views/layouts/mailer/base.liquid` | Plantilla base de los emails de notificacion: barra de acento y boton en `#f2790e`, texto y enlaces en `#cc4e00` (el naranja accesible de la escala). |
| `app/models/portal.rb`, `app/services/onboarding/web_widget_creation_service.rb` | Constantes Ruby `DEFAULT_COLOR` / `DEFAULT_WIDGET_COLOR`. **No son migraciones**: cambiarlas no toca la base de datos. |
| `public/{404,422,500}.html` | Paginas de error estaticas: degradado y boton en azul de marca. |
| `theme/icons.js` | Icono `status-open` (conversacion abierta): usaba el hex de marca `#2781f6`. |
| `app/javascript/dashboard/components-next/HelpCenter/PortalSwitcher/CreatePortalDialog.vue` | Color por defecto de un portal nuevo del centro de ayuda. |
| `app/javascript/dashboard/components-next/message/bubbles/Dyte.vue` | `bg-[#2781F6]` hardcodeado en la burbuja de videollamada. |
| `app/javascript/dashboard/components/widgets/conversation/conversation/LabelSuggestion.vue` | Color de la etiqueta seleccionada. |
| `app/javascript/widget/components/ChatInputWrap.vue` | Fallback de `var(--widget-color, ...)` en el widget. |
| `app/views/layouts/vueapp.html.erb` | `<meta name="theme-color">` y `msapplication-TileColor`. **El `<link rel="icon" sizes="512x512">` NO se toca**: ya usa `@global_config['LOGO_THUMBNAIL']`, que viene de `installation_configs`. |
| `app/views/devise/mailer/_confirmation_body.html.erb` | Boton y enlace del email de confirmacion de cuenta. |
| `public/manifest.json` | `name`/`short_name` → "Foxxy Chat", `theme_color`/`background_color` → `#f2790e`. |
| `public/*.png` (28 ficheros) | `android-icon-*`, `apple-icon-*`, `favicon-*`, `favicon-badge-*`, `ms-icon-*` regenerados desde el logo de Foxxy. Ver seccion 4. |
| `public/brand-assets/{logo,logo_dark,logo_thumbnail}.svg` | Assets de marca **por defecto**. En produccion los sobrescribe `installation_configs`, pero `app/views/super_admin/application/_navigation.html.erb` y la pagina de onboarding los referencian por ruta fija. |
| `docker/build-foxxy.sh` | *(nuevo)* Build reproducible de la imagen CE. |
| `README-FOXXY.md` | *(nuevo)* Este documento. |
| `README.md` | Banner de 4 lineas apuntando aqui. Unico cambio. |

### Decisiones de diseno que reducen el coste de rebase

- **No se han renombrado las variables CSS `--blue-*` ni las clases `n-blue-*`.**
  Renombrarlas habria tocado ~93 ficheros `.vue` y convertido cada rebase en un
  campo de minas. Solo cambia el **valor**, en un unico fichero. Los nombres
  quedan "mintiendo" (una var que se llama `blue` y vale naranja); es un precio
  barato comparado con la alternativa, y esta comentado en el propio fichero.
- **No se toca `theme/colors.js` mas alla de dos claves** (`woot` y `n.brand`).
- **No se anaden migraciones de base de datos.** Ver seccion 6.
- Todos los cambios llevan un comentario `FOXXY:` para que `grep -rn "FOXXY:"`
  liste el 100% de la superficie del fork en codigo.

---

## 4. Iconos

Generados desde `logo.png` (500x500, fondo transparente) de
[`Kiware-co/foxxy-website`](https://github.com/Kiware-co/foxxy-website)
(`public/logo.png`). Se recorta al bounding box del zorro y se centra en un
lienzo cuadrado ocupando el 94% del lado, con fondo transparente — igual que
hacian los iconos originales de Chatwoot.

Tamanos regenerados:

- `android-icon-{36,48,72,96,144,192}x*.png`
- `apple-icon-{57,60,72,76,114,120,144,152,180}x*.png`, `apple-icon.png`, `apple-icon-precomposed.png`
- `favicon-{16,32,96,512}x*.png`
- `favicon-badge-{16,32,96}x*.png` — variante con el punto de "sin leer". Se ha
  respetado la geometria exacta del original de Chatwoot (diametro 43,75% del
  lado, centro en 72,4% / 26,6%) y se ha cambiado el rojo a `#ef391f`
  (`--color-accent-3` de Foxxy).
- `ms-icon-{70,150,310}x*.png`

`apple-touch-icon.png` y `apple-touch-icon-precomposed.png` siguen siendo
ficheros de 0 bytes, igual que en upstream: no se referencian desde el layout.

---

## 5. Construir la imagen

El repo trae `docker/build-foxxy.sh`, que replica el workflow oficial
`publish_foss_docker.yml` de Chatwoot para la edicion Community.

```bash
# En un clon LIMPIO y desechable (el script borra enterprise/ y edita el Dockerfile)
git clone --depth 1 --branch foxxy-main https://github.com/Kiware-co/foxxy-chat.git
cd foxxy-chat
DOCKER="sudo -n docker" ./docker/build-foxxy.sh localhost:5000/kiware-co/foxxy-chat:v4.17.1-foxxy.1
docker push localhost:5000/kiware-co/foxxy-chat:v4.17.1-foxxy.1
```

Convencion de tags: `v<version-upstream>-foxxy.<n>`, donde `<n>` se incrementa
en cada rebuild sobre la misma version de upstream.

El build tarda ~15-25 min (compila gemas nativas en Alpine y hace el bundle de
Vite). Necesita ~4 GB de RAM libres: `NODE_OPTIONS=--max-old-space-size=4096`.

---

## 6. Rebase sobre una version nueva de Chatwoot

El fork esta pensado para que subir de version sea `git rebase --onto`. Los
parches Foxxy son commits encima del tag upstream, nunca merges.

```bash
# 1. Traer los tags nuevos de upstream
git remote -v                      # 'upstream' debe apuntar a chatwoot/chatwoot
git fetch upstream --tags

# 2. Rebasear los commits Foxxy del tag viejo al tag nuevo
#    (aqui: de v4.17.1 a v4.18.0)
git checkout foxxy-main
git rebase --onto v4.18.0 v4.17.1 foxxy-main

# 3. Resolver conflictos (ver abajo) y verificar que no se escapo nada azul
grep -rn "FOXXY:" theme app/javascript app/views public | wc -l
grep -rni "2781f6" --include='*.js' --include='*.vue' --include='*.scss' \
     --include='*.erb' --include='*.json' . | grep -v node_modules

# 4. Etiquetar y construir
git tag foxxy-v4.18.0-1
git push origin foxxy-main --force-with-lease --tags
./docker/build-foxxy.sh localhost:5000/kiware-co/foxxy-chat:v4.18.0-foxxy.1
```

### Donde esperar conflictos, y que hacer

| fichero | riesgo | como resolver |
| --- | --- | --- |
| `theme/colors.js` | **medio** — upstream toca la seccion `n:` con frecuencia | Quedarse con la version de upstream y reaplicar solo dos cosas: el `require` de `orange`/`orangeDark` + el bloque `woot`, y `brand: '#f2790e'`. |
| `_next-colors.scss` | **medio** — upstream anade tokens nuevos | Quedarse con upstream y reaplicar los valores de la tabla de la seccion 2.2. Si upstream anade un token `--*-blue-*` nuevo, retintarlo tambien. |
| `super_admin/index.scss` | bajo | Igual que el anterior. |
| `theme/icons.js` | bajo, pero es un fichero generado de 97 KB | Si conflictua, quedarse con upstream y volver a hacer `sed -i 's/#2781f6/#f2790e/g' theme/icons.js`. |
| `public/*.png` | ninguno salvo que upstream cambie de logo | `git checkout --ours` (los nuestros). |
| `public/manifest.json` | bajo | Reaplicar nombre + colores. |
| `vueapp.html.erb` | bajo | Cuidado: **no** convertir el `<link rel="icon" sizes="512x512">` a ruta fija; debe seguir usando `@global_config['LOGO_THUMBNAIL']`. |
| `README.md` | bajo | Quedarse con upstream y reponer el banner. |

### Checklist de verificacion tras rebasear

1. Barrido de azules. Ninguno de estos debe aparecer fuera de lo listado en la
   seccion 7:

   ```bash
   for h in 2781f6 1f93ff 009ce0 7eb6ff 086de0 daecff "39, 129, 246"; do
     echo "== $h"; grep -rli "$h" app/ theme/ config/ public/ | grep -v '\.png$'
   done
   ```

   Ojo: la escala de acento del design system "next" esta **duplicada en cuatro
   ficheros** (`_next-colors.scss`, `super_admin/index.scss`, `widget/.../woot.scss`
   y `widget-preview/.../Widget.vue`). Si upstream anade un token nuevo, hay que
   retintarlo en los cuatro.
2. `./docker/build-foxxy.sh <tag>` termina sin errores.
3. Arrancar la imagen y comprobar a ojo: boton primario naranja, sidebar,
   modo oscuro, favicon, y que verde/rojo/ambar siguen siendo verde/rojo/ambar.

---

## 7. Azules que quedan a proposito

- **`app/javascript/dashboard/components-next/icon/Logo.vue`** — SVG del logo de
  Chatwoot en `#2781F6`. **Solo se renderiza si `globalConfig.logoThumbnail`
  esta vacio**, y en produccion no lo esta (`installation_configs`). Se deja
  intacto porque es la marca registrada de Chatwoot: preferimos no renderizarla
  a repintarla de naranja.
- **`#1f93ff` como valor por defecto de COLUMNA en base de datos** —
  `channel_web_widgets.widget_color` y `labels.color` (`db/schema.rb`, y el
  comentario de anotacion en `app/models/channel/web_widget.rb` y
  `app/models/label.rb`). Cambiarlos exige una migracion, y una migracion se
  ejecuta contra la base de datos de produccion en el despliegue: fuera de
  alcance a proposito. En la practica casi no se nota, porque las dos rutas por
  las que se crea un widget si pasan color explicito y ya son naranjas
  (`Onboarding::WebWidgetCreationService::DEFAULT_WIDGET_COLOR` y el color
  preseleccionado en `Website.vue`). El hueco real que queda: **una etiqueta
  creada por API sin color nace azul**. Si algun dia molesta, la via limpia es
  una migracion propia en el fork, nunca editar `db/schema.rb` a mano.
- **`$blue: #1f93ff !default`** en `app/assets/stylesheets/administrate/library/_variables.scss`
  — es la paleta de colores con nombre de la gema administrate, no la marca. El
  que si es marca (`$color-woot`) esta en `utilities/_variables.scss` y ya es naranja.
- **`app/javascript/dashboard/helper/specs/fixtures/automationFixtures.js`** — fixture de tests.
- Los colores semanticos (verde/rojo/ambar/violeta/teal/iris) se quedan como
  estan: son estado, no marca.

---

## 8. Licencia

Chatwoot es MIT salvo `enterprise/`. Este fork:

- **no modifica** `LICENSE` ni `enterprise/LICENSE`;
- **no elimina** el aviso de copyright `Copyright (c) 2017-2026 Chatwoot Inc.`;
- construye la imagen en modo **Community Edition**, borrando `enterprise/` y
  `spec/enterprise/` antes del `docker build`, igual que el workflow oficial.

Los cambios de este fork son de identidad visual (paleta e iconos) y estan
sujetos a la misma licencia MIT.
