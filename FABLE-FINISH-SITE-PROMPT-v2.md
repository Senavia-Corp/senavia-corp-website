# SUPER-PROMPT v2 — Terminar por completo el sitio de SENAVIA Corp (modo automático, endurecido)

> Pega TODO este prompt en una sesión nueva (modo automático) abierta en `/Users/senavia/Sites/senavia-corp/`.
> Está diseñado para ejecutarse de principio a fin sin intervención humana: orquesta varios agentes que
> **arrancan su propio harness, auditan en solo-lectura, cruzan un gate antes de tocar código, arreglan con
> propiedad exclusiva de archivos, verifican a ciegas y nunca despliegan.**
>
> **Regla de oro que rige sobre todo lo demás:** si el repositorio contradice cualquier dato de este
> documento, **gana el repositorio**. Este prompt describe el mundo tal como estaba el 2026-06-12; el código
> ha cambiado desde entonces. No persigas fantasmas: mide contra el build real, no contra estos números.
> Toda discrepancia se registra en `_qa/STATE/DISCREPANCIES.md`.
>
> **NO debe hacer deploy — y en este repo un `git push` a `main` ES un deploy** (auto-deploy de Vercel sobre
> GitHub). Lee §7 antes de tocar git.

---

## 0. MISIÓN

Eres el **director técnico y de diseño** de un equipo de agentes de calidad. Tu trabajo es dejar el sitio de
marketing de SENAVIA Corp **100% terminado, pulido, seguro y listo para deploy — pero SIN desplegar.** El
sitio ya está migrado a Astro y funciona; falta *terminarlo de verdad*: eliminar lo que esté a medias,
elevar diseño y experiencia a nivel de agencia premium, blindar la seguridad, y garantizar que en móvil se
vea y se sienta excelente.

El trabajo avanza en **FASES con gates de salida verificables**, no en un revoltijo simultáneo:

```
FASE 0  Bootstrap (1 agente, bloqueante) ─▶ gate: _qa/harness-ready.json
FASE 1  Auditoría READ-ONLY (8 lentes)    ─▶ GATE G1 (baseline congelada + backlog deduplicado)
FASE 2  Fixes (ownership exclusivo)        ─▶ cada paquete: verify-before-accept
FASE 3  Verificación ciega + anti-regresión─▶ gates §8 (duros + de juicio)
ENTREGA rama lista + reporte + mensaje al humano (el humano mergea y despliega)
```

**Auditar TODO antes de tocar nada.** Ningún agente edita un archivo versionado hasta que G1 esté declarado
en verde por escrito. Sé escéptico de tu propio trabajo: cada cambio se valida con evidencia reproducible
(un comando + su salida, o una captura + un criterio), nunca se asume correcto.

**Dos estados terminales válidos:**
- **VERDE** — todos los gates de §8 pasan sin excepciones.
- **VERDE CON EXCEPCIONES DOCUMENTADAS** — todos los gates alcanzables pasan; los inalcanzables están
  registrados en `_qa/EXCEPTIONS.md` con evidencia, intentos y propuesta para el humano. Este resultado es
  **legítimo y preferible** a iterar infinito o declarar un verde falso. **Ninguno de los dos estados
  autoriza a mergear a `main`** — eso lo hace el humano (§7, §9).

---

## 1. CONTEXTO DEL PROYECTO (solo hechos estables — los volátiles están en APÉNDICE A)

- **Ubicación:** `/Users/senavia/Sites/senavia-corp/`.
- **Stack:** Astro 5 (output estático), TypeScript strict. Una isla React: el Estimator
  (`src/components/Estimator.tsx`, `client:load`). Adaptador `@astrojs/vercel` con `imageService: false`
  (las imágenes viven en `public/` sin procesamiento de Astro → optimizar peso en disco, no vía Astro).
- **CSS único:** `src/styles/senavia.css` (~2.3k líneas) con design tokens ya definidos:
  `--primary #99CC33` (lime, CTAs) · `--secondary #0A0E26` (navy, fondo) · gradientes nombrados. Tipografía
  **Inter** self-hosted vía `@fontsource-variable/inter` (importada en `BaseLayout.astro`).
- **Contenido = Sanity (fuente de verdad).** Proyecto **`zx255dw6`**, dataset `production`. `src/content.config.ts`
  carga 6 colecciones vía GROQ **en build time**: `blog`, `portfolio`, `serviceAreas`, `logos`, `videos`,
  `testimonials`. El cliente Sanity vive en `src/lib/sanity.ts` y lee `SANITY_API_TOKEN` de `.env.local`.
  **Excepción:** `src/content/testimonials.json` (8 entradas) es un archivo local, no Sanity. **No existe
  `src/content/blog/*.mdx`** — cualquier MDX que crees será ignorado por el loader.
- **Componentes globales:** `BaseLayout.astro` (head, SEO, JSON-LD, Calendly lazy, Plausible, script i18n),
  `Nav.astro`, `Footer.astro`, `LangSwitcher.astro`, `Seo.astro`, `JsonLd.astro`. Datos centralizados en
  `src/data/site.ts`.
- **i18n = swap por CSS (una sola URL).** `<html>` alterna clase `lang-en`/`lang-es`; el copy se envuelve en
  `<span class="lang-only-en">…</span><span class="lang-only-es">…</span>`; persistencia en
  `localStorage['senavia.lang']`; script anti-flash en `<head>`. **No hay URLs por idioma** → hreflang es un
  único `x-default` absoluto (correcto para este patrón — ver §5 e i18n-SEO).
- **Conversión:** Calendly es el ÚNICO canal (popup global lazy + inline en `/schedule` y `/contact`). URL en
  `SITE.CALENDLY_URL`. **No hay formularios ni backend.** Trigger real: atributo `[data-calendly-trigger]`.
- **NAP:** SENAVIA Corp · 150 S Pine Island Rd, Suite 377, Plantation, FL 33324 · (754) 262-3659 ·
  info@senaviacorp.com · Mon–Fri 8:00am–6:00pm · Google Partner. **Vive en `src/data/site.ts` y alimenta el
  JSON-LD** → archivo congelado (§7).
- **Dominio actual = `new.senaviacorp.com` (STAGING).** `SITE.url`, `SITE.domain`, `astro.config.mjs` `site`,
  el `Sitemap:` de `robots.txt` y el `data-domain` de Plausible en `BaseLayout.astro` apuntan ahí. El dominio
  de producción es una **decisión del humano pendiente** — no lo cambies tú (§7); el swap es acción humana
  pre-deploy (§9).
- **`_qa/` está gitignored** (artefactos de QA: capturas, reportes, results.json). También lo están
  `scripts/`, `.env`, `.env.local`, `.env.*.local`, `.vercel/`, `dist/`, `_source/`.
- **El harness de QA NO existe todavía.** El `_qa/audit.mjs` que versiones anteriores daban por hecho no está
  en disco (se perdió por estar en `_qa/`, gitignored). **La FASE 0 lo reconstruye** en `tools/qa/` (versionado).
  Playwright `^1.60` y `@axe-core/playwright` **sí** están en devDependencies.

---

## 2. FASE 0 — BOOTSTRAP (1 agente, bloqueante, secuencial)

Nada de lo demás arranca hasta que esta fase escriba `_qa/harness-ready.json`. Pasos en orden:

**2.1 Guardrail físico anti-deploy (PRIMER comando de la sesión):**
```
git remote set-url --push origin DISABLED-no-push
```
Esto deshabilita todo `git push`. Anota en el mensaje final al usuario el comando exacto para revertirlo:
`git remote set-url --push origin https://github.com/Senavia-Corp/senavia-corp-website.git`
(va en el mensaje final Y en el reporte, porque `_qa/` no sobrevive al merge).

**2.2 Arranque idempotente (primera ejecución vs reanudación):**
- Si `_qa/STATE/` **ya existe** → es una REANUDACIÓN: re-lee `PLAN.md`, `PROGRESS.md`, `GATES.md`, archiva los
  artefactos de la corrida anterior a `_qa/archive-<fecha>/` (para que no contaminen la evidencia) y continúa
  desde el último checkpoint.
- Si **no existe** → primera ejecución. Estado de git a resolver: la rama `feat/finish-site` **ya existe pero
  está obsoleta** (0 commits por delante de `main`, ~20 por detrás; su contenido ya está en `main`). Bórrala y
  recréala desde `main` limpia:
  ```
  git checkout main && git branch -D feat/finish-site && git checkout -b feat/finish-site
  ```
  (Nunca asumas "main limpia sin más" ni hagas `checkout -b` sobre una rama existente.)

**2.3 Reconstruir el harness en `tools/qa/audit.mjs` (VERSIONADO, no en `scripts/` ni `_qa/` — ambos
gitignored, así se perdió el anterior).** Spec completa en APÉNDICE B. Resumen:
- Descubre las rutas del **build real**: corre `npm run build` fresco y enumera `dist/**/*.html` + `dist/sitemap-*.xml`.
  El build hace fetch a Sanity (`zx255dw6`) en build time → **verifica conectividad a Sanity como
  precondición**; si el sandbox bloquea dominios externos, fallback = enumerar el `dist/` existente +
  `getStaticPaths`. Nunca hardcodees el número de páginas (hoy ≈ 100).
- 6 viewports: **360 · 390 · 768 · 1280 · 1440 · 1920**, × **EN y ES**. El idioma se siembra con
  `page.addInitScript` poniendo `localStorage['senavia.lang']='es'` **antes** de navegar (ver APÉNDICE B).
- Checks: overflow horizontal por `document.scrollWidth`, errores de consola contra allowlist, requests con
  status ≥400 (solo same-origin), violaciones axe `wcag2aa` serious/critical, capturas full-page en
  `_qa/iteration-NN/shots/`, y salida **machine-readable** `_qa/iteration-NN/results.json` (esquema en APÉNDICE B).
- **Calíbralo antes de confiar en él:** siembra a propósito un defecto (un `<div>` con `width:200vw`), corre el
  harness en 2 rutas, confirma que detecta el overflow, y quítalo. Sin esta calibración el harness no es fuente
  de evidencia válida.
- Escribe `_qa/harness-ready.json` = `{ ready: true, rutas: N, viewports: [...], calibrado: true }`. **Ningún
  auditor arranca si este archivo no existe.**

**2.4 Inventario real** (`_qa/iteration-01/inventory.json`), derivado por herramienta, no por este prompt:
rutas desde `dist/`, links `href="#"` con conteo por archivo (crawl), placeholders por **texto renderizado**
(no fuente cruda), y mapa de contenido Sanity (blog/portfolio/testimonios publicados). Este inventario, no
APÉNDICE A, es la lista de trabajo.

---

## 3. PERMISOS Y LIBERTAD CREATIVA

El dueño (Sebastian, sebastian@senaviacorp.com) te autoriza explícitamente a: rediseñar secciones/páginas a
nivel agencia premium; cambiar fondos, gradientes, composición; reemplazar/generar imágenes (SVG,
optimización); reescribir y crear copy de marketing EN y ES; crear componentes, refactorizar markup, ajustar
el CSS global; terminar páginas a medias.

Úsalo con criterio de **diseñador senior**: coherencia, jerarquía, aire, ritmo, una sola dirección de arte
(navy + lime, tech/premium, bilingüe South Florida).

**Carve-out de veracidad (obligatorio):** el copy de *marketing* es libre; los **hechos verificables NO se
inventan** — testimonios, reseñas, ratings, cifras, fechas, nombres de clientes o resultados de proyectos.
Ver §5 (Veracidad) y §7.

---

## 4. FASE 1 — AUDITORÍA READ-ONLY (8 lentes en paralelo)

**Regla dura de la fase:** ningún agente modifica archivos **versionados** (`src/`, `public/`, config,
`vercel.json`). Se permite escribir en `_qa/` y generar artefactos de build gitignored (`dist/`, `.astro/` —
el harness los necesita). Lanza las 8 lentes simultáneamente (Workflow tool o múltiples subagentes en un
mismo mensaje). Corre `node tools/qa/audit.mjs 01 --full` primero para darles evidencia base.

**Contrato de salida (a prueba de compactación de contexto):** cada lente **escribe**
`_qa/iteration-NN/findings-<lente>.json`; su mensaje de retorno al director es solo un **resumen**. Nunca
devuelvas findings crudos al contexto del director. Esquema por finding:
```
{ id: "MOB-001", lente, ruta, viewport, lang, severidad: "P0|P1|P2|P3",
  descripcion, evidencia: "ruta/a/captura-o-medición", causa_raiz, archivos_implicados: [...],
  fix_sugerido }
```

### Las 8 lentes

1. **Móvil (prioridad #1).** 360×800 y 390×844, EN y ES, full-page. Estándar: que un diseñador senior no
   objete nada en un iPhone real. Checklist obligatorio → **0 overflow horizontal**; touch targets ≥44×44
   (controles no-inline); tipografía legible y jerarquía clara; heros donde el copy+CTA caben above-the-fold
   sin CLS (poster en móvil, video ≥768px); menú móvil abre/cierra/scroll-lock/accesible; switcher EN/ES
   visible, persistente, sin flash; carruseles con swipe fluido y dots tocables; Estimator usable con el
   pulgar y abre Calendly con prefill; imágenes con `object-fit` correcto; ritmo de espaciado; cada página
   carga solo su hero (lazy below-the-fold, `preload="metadata"` en videos).
2. **Desktop/Tablet.** Layout y pulido en 768 / 1280 / 1440 / 1920.
3. **Contenido + Veracidad.** Links muertos, placeholders, secciones vacías, blog/portfolio/testimonios
   incompletos, copy de relleno, mapa. **Y** extrae TODO claim factual a `_qa/iteration-NN/claims.json` con
   estado `verificado | no-verificable | contradice-evidencia`. Audita lo **ya fabricado**:
   `testimonials.json` (8 entradas), «47 verified reviews» (5 archivos), «Est. 2019» en `about.astro` →
   marcar `requiere_dueño`. Clasifica cada placeholder como `autocompletable` (mapa, links, copy genérico) o
   `requiere_dueño` (testimonios, logos con permiso, métricas de casos).
4. **i18n.** Cobertura EN/ES real página por página; lista exacta de textos sin envolver en `lang-only-*`.
5. **Accesibilidad.** axe-core `wcag2aa`, contraste AA (ojo: lime sobre claro), foco de teclado, alt text,
   jerarquía de headings (un solo H1).
6. **Marca/Diseño.** Consistencia de dirección de arte, tokens, ritmo visual, calidad de heros e imágenes.
7. **Performance.** Herramienta fija: `npx lighthouse@12` (preset mobile y desktop) contra `npm run preview`
   en rutas representativas (home, services, 1 subservicio, 1 post, 1 caso, pricing, contact), con
   `CHROME_PATH` = Chromium cacheado de Playwright. Fallback si Lighthouse no corre en sandbox: métricas vía
   Playwright (`PerformanceObserver` para LCP/CLS, resource timing para peso; TBT no es medible así → aproxima
   con Long Tasks o decláralo omitido). JSON en `_qa/iteration-NN/lighthouse/`. Presupuestos en §8.
8. **Seguridad** (nueva — el dueño la pide explícitamente). Escribe `findings-seguridad.json`:
   - **Escaneo de secretos** en `src/`, `public/`, `dist/` (post-build), working tree e historial git —
     comparando los **valores** de las vars NO-`PUBLIC_` (solo `SANITY_API_TOKEN`), **sin imprimirlos jamás**
     (compara conteos). No uses regex de nombres genéricos (falsea con la línea legítima
     `token: import.meta.env.SANITY_API_TOKEN`). `production` y `zx255dw6` son públicos por diseño.
   - **Archivos ajenos en `public/`:** inventaríalos y **FLAGGÉALOS para decisión humana** — **nunca los
     borres autónomamente**. `public/gqm/RESUMEN-CORRECCIONES-JEFERSON.html` fue publicado a propósito
     (redactado + `noindex`); no es un hallazgo P0, es un ítem de confirmación.
   - **`npm audit`** (completo; **prohibido `npm audit fix --force`**; solo fixes no-major; excepción
     documentada para vulns de toolchain build-time que no afectan el output estático).
   - **CSP:** inventaría los 3 scripts `is:inline` (BaseLayout, thank-you, service-areas/[slug]); la CSP de
     `vercel.json` **ya** permite Maps, youtube-nocookie y Calendly. El riesgo no son los embeds de §5 sino
     **nuevos orígenes de script/connect/font** que un rediseño añada.
   - **Dependencias:** verifica pinning; no propongas eliminar `@sanity/client` (**está en uso** vía
     `content.config.ts`).

**Nota:** los "errores de consola" de Calendly/Plausible/YouTube bloqueados por el sandbox son artefactos
esperados (allowlist en APÉNDICE B), no defectos.

---

## GATE G1 — de auditoría a fixes (el director lo declara por escrito en `_qa/STATE/GATES.md`)

No se toca ningún archivo versionado hasta que TODO esto sea cierto:
- **(a) Cobertura:** matriz ruta×lente adjunta. Para lentes visuales: 100% de **plantillas únicas** + muestra
  representativa de rutas dinámicas (blog/[slug], portfolio/[slug], service-areas/[slug], subservicios). Para
  checks automatizables (links/404, overflow, axe): **100% de las rutas** del build.
- **(b) Evidencia:** todo finding tiene captura o medición; los que no, se descartan.
- **(c) Backlog deduplicado:** `_qa/BACKLOG.md` + `_qa/iteration-NN/worklist.json` con findings agrupados por
  **causa raíz + archivo** (un solo ítem para "el CSS del carrusel rompe en 360px" aunque afecte 9 rutas),
  ordenados P0→P3, con **IDs estables**. El consolidador enruta TODO cambio a archivos compartidos (§5, hot
  files) a un único paquete.
- **(d) Baseline inmutable congelada:** copia `iteration-01` a `_qa/baseline/` (directorio **write-once**);
  tag git local `qa-baseline` (sin push); dump de `npm audit`; **copia de `vercel.json` como baseline de CSP/
  headers** (NO headers observados localmente — `astro preview` no aplica los de `vercel.json`, saldrían
  vacíos); manifiesto de contenido real (Sanity: qué posts/casos/testimonios publicados existen); baseline de
  `npm run check` (hoy ≈ **69 errores** preexistentes — es el punto de partida del ratchet, §8).
- **(e) Harness:** `_qa/harness-ready.json` existe y el director lo re-ejecutó.

---

## 5. FASE 2 — FIXES (propiedad exclusiva de archivos, sin git worktrees)

Los fixers reciben ítems del backlog **por ID** — nunca "mejora lo que veas". Todo hallazgo nuevo se registra
en el backlog, no se arregla ad-hoc.

**Concurrencia y ownership (evita ediciones perdidas):**
- El consolidador arma paquetes desde `src/pages/` **real** con file-sets **disjuntos**; valida que la
  intersección entre paquetes concurrentes sea vacía antes de lanzar.
- **HOT FILES — un único dueño (Agente Design-System):** `src/styles/senavia.css`, `BaseLayout.astro`,
  `Nav.astro`, `Footer.astro`, `LangSwitcher.astro`, `src/data/site.ts`, `public/scripts/home.js`. Los fixers
  de página **no** los tocan: usan `<style>` scoped en su propio `.astro`, o piden el cambio por un buzón
  (`/Users/senavia/Sites/senavia-corp/_qa/phase2/css-requests.md`, ruta **absoluta** del checkout principal).
- **Árbol compartido con ownership exclusivo — NO git worktrees.** (Los worktrees nacen sin `node_modules` ni
  `.env.local`, así que los fixers no podrían buildear ni correr Playwright ahí; y la partición ya es disjunta,
  así que los worktrees solo añaden costo.) Máximo **3–4 fixers de escritura concurrentes** (los auditores
  read-only pueden ser 8).
- **Commits:** atómicos por lote **VERIFICADO** (checkpoint de rollback), stage explícito de los archivos del
  lote sobre `feat/finish-site`. **Prohibido** `git add -A`, `git rebase`, `--force`, `reset --hard` sobre
  trabajo commiteado, y `rm -rf` fuera de `_qa/`.

**Estrategia de contenido:**
- **Sanity es la fuente de verdad.** Antes de tocar blog/portfolio/testimonios, consulta el inventario real
  (build/manifiesto). **No crees MDX** (el loader lo ignora). **PROHIBIDO escribir** (create/patch/publish/
  delete) en el dataset `production` de Sanity — `SANITY_API_TOKEN` es solo de lectura en build. Los posts o
  casos nuevos que superen el quality-bar (dato local de South Florida, experiencia propia, autor real) se
  dejan como **borradores locales** `content-drafts/*.md` en la rama, documentados en el reporte como
  pendientes de aprobación del dueño.
- **Contenido delgado:** publica solo lo verificable. Si no hay material real suficiente, **rediseña el grid
  al inventario real** — pocos casos fuertes > muchas tarjetas thin (mejor para SEO/E-E-A-T). El trabajo
  probable no es crear contenido, sino QA del contenido Sanity ya renderizado (tarjetas, imágenes, links, i18n).

**Veracidad (no fabricar):** los placeholders `requiere_dueño` se cierran llevándolos a un **estado terminado
neutro** — rediseñar la sección en torno a datos verificables o al enlace al perfil real de Google, **sin
inventar** y **sin eliminar la URL** (§7 prohíbe borrar rutas; conserva paridad EN/ES). La página
`/testimonials` no se oculta: se rediseña en torno a lo real. Las decisiones que requieren al dueño van a
`_qa/DECISIONS-NEEDED.md` **y** al mensaje final (§9), porque `_qa/` no sobrevive al merge.

**Decisión i18n-SEO (automática, sin escalar a mitad de corrida):** el toggle ES es un activo de **UX/
conversión**, NO un activo SEO — es correcto que aporte valor a visitantes bilingües, pero con el patrón
CSS-swap el español no tiene URL propia indexable. **Default = Opción A:** mantener solo `x-default`, y el
FINAL-REPORT declara en "Limitaciones SEO conocidas" que el contenido ES no rankea con URL propia y que el
marketing no debe prometer "SEO bilingüe". **Opción B** (rutas `/es/` reales con Astro i18n routing, pares
hreflang, `<html lang="es">`, meta/OG traducidos) queda como **backlog documentado** (ojo: manteniendo el
CSS-swap, /es/ duplicaría el texto → riesgo de contenido duplicado; anotarlo).

**Mapa de contacto y embeds nuevos (§ política de terceros, §7):** el mapa de Google **ya** está permitido por
la CSP (`frame-src google.com/maps.google.com`) y ya carga lazy vía IntersectionObserver — no aflojes la CSP
"para que funcione". Todo iframe nuevo lleva `loading="lazy"`, `title` descriptivo y
`referrerpolicy="strict-origin-when-cross-origin"`; YouTube **siempre** vía `youtube-nocookie.com`; Calendly
sigue lazy (nunca eager). **No añadas orígenes nuevos a la CSP**; si un rediseño lo exige, es un cambio
**propuesto al humano** con diff citado, nunca silencioso. Todo script externo **versionado** nuevo lleva
**SRI** (`integrity` + `crossorigin`); para Plausible, evalúa self-host/proxy oficial para sacar
`plausible.io` de `script-src` — cambio **propuesto al humano**, no obligatorio.

**Fix concreto ya identificado (SEO):** `src/pages/blog/[slug].astro` pasa `jsonLdType="blog"` pero **no** pasa
`jsonLdData`, y `JsonLd.astro` solo emite `BlogPosting` si `data.headline` existe → los posts salen sin
`BlogPosting`. Fix: `jsonLdData={{ headline: data.title, datePublished: data.pubDate?.toISOString(),
image: <URL absoluta de data.mainImage>, description: data.seoDescription || data.summary }}` (el `author` ya
lo inyecta `JsonLd.astro` como Organization).

**Centralización del dominio:** que toda URL absoluta derive de `SITE.url`/`SITE.domain`; mueve el
`data-domain` de Plausible en `BaseLayout.astro` a `{SITE.domain}`. Objetivo: **un solo punto de cambio** para
el swap de dominio (§9).

---

## 6. FASE 3 — VERIFICACIÓN CIEGA + ANTI-REGRESIÓN

**Verificación ciega:** el verificador es **siempre** un agente distinto del fixer y del director. Recibe
únicamente `{ paquete_id, rutas_afectadas, gate_de_salida, findings originales (ids + capturas "antes") }` —
**nunca el diff ni la explicación del fixer**. Debe **redescubrir** que el defecto desapareció, no confirmar la
narrativa. Re-corre el harness sobre las rutas del paquete, compara capturas antes/después, y escribe
`_qa/iteration-NN/verdict-<paquete>.json` = `{ veredicto: "pass|fail", evidencia, regresiones_detectadas }`
con **default FAIL** ante la duda.

**Integración:** **verify-before-accept** — el director NO acepta/commitea un paquete en `feat/finish-site`
hasta que el verificador ciego emita `pass`; la aceptación de paquetes se **serializa**. Un `fail` reabre el
paquete con contador de intentos (**máx 2**, luego a `_qa/BLOCKERS.md`).

**Anti-regresión (el sitio tiene UN CSS global y componentes compartidos):**
- Tras cada lote se re-corre el **harness completo** (todas las rutas × viewports × EN/ES) — no solo las
  rutas tocadas; es un sitio estático, cuesta minutos.
- **Diff numérico** de `results.json` contra la iteración anterior: cualquier métrica que empeore en
  **cualquier** ruta (nuevo overflow, nueva violación axe, nuevo 404, nuevo error de consola) = regresión →
  el lote se revierte (por eso el commit por lote) o se corrige antes de continuar.
- Todo cambio a un **hot file** (§5) dispara re-run completo inmediato, sin excepción.
- Pixel-diff de rutas no tocadas: **solo** si el harness congela animaciones (emular
  `prefers-reduced-motion`, pausar videos/mostrar poster, desactivar transiciones); si no, omítelo y confía en
  el diff numérico. Requiere `pixelmatch`+`pngjs` como devDependencies.

**Cierre de gates:** cada gate de §8 lo firma un agente que **no escribió una línea de código** en la sesión,
re-ejecutando desde cero el comando del gate. En el reporte, cada gate registra **comando + salida literal**
(para gates duros) o **captura fresca fechada + criterio** (para gates de juicio) y qué agente lo verificó.
Un gate sin evidencia reproducible **no cuenta como verde**.

---

## 7. RESTRICCIONES DURAS (no romper, aunque mejore lo estético)

1. **NO deploy — cadena causal completa.** Prohibido: cualquier comando `vercel`; **`git push` a cualquier
   remoto o rama** (un push a `main` ES un deploy por el auto-deploy Vercel–GitHub); `gh pr create/merge`;
   **el merge a `main` queda fuera de alcance** (invita al push habitual) — lo hace el humano. No modifiques
   `.vercel/` ni ejecutes comandos `vercel`. El guardrail físico de §2.1 ya deshabilitó el push.
2. **Secretos.** PROHIBIDO leer, imprimir, copiar, mover o commitear `.env*`. Ningún valor de variable de
   entorno aparece en commits, reportes, capturas ni mensajes — referéncialas solo por **NOMBRE**. Prohibido
   añadir fallbacks hardcodeados de tokens/keys (el patrón `|| 'valor'` solo vale para **IDs públicos**
   existentes como `zx255dw6`). No debilites la cobertura de `.env`/`.env.local`/`.env.*.local`/`.vercel`/`_qa`
   en `.gitignore`. **No escribas al dataset `production` de Sanity.**
3. **Archivos congelados (solo lectura salvo excepción documentada con diff citado):**
   - `src/data/site.ts` → exports `SITE` (incl. `url`, `domain`), `NAP`, `CALENDLY_URL`, `SOCIAL`,
     `GOOGLE_PARTNER_URL`: **ni un dígito cambia**. El export `NAV` **sí** es editable (copy bilingüe).
   - `vercel.json`: única edición permitida = añadir un dominio a la CSP existente **solo** si un embed nuevo
     lo requiere, con diff citado en el reporte. Los headers de seguridad (HSTS/XCTO/XFO/Referrer/Permissions)
     quedan intactos (diff contra `main` = gate).
   - `astro.config.mjs`, `public/robots.txt`: congelados.
4. **Rutas/slugs:** no cambies URLs existentes ni reintroduzcas slugs ya redirigidos en `vercel.json` (p. ej.
   `digital-marketing`, ya 301→`traffic-generation`). Puedes **añadir** rutas.
5. **Borrado:** prohibido eliminar archivos bajo `public/images|videos/**` — los placeholders se **reemplazan**,
   no se borran. Prohibido mutar/despublicar/eliminar documentos de Sanity y editar destructivamente
   `content.config.ts` o `src/lib/sanity.ts`. Toda eliminación requiere entrada en el reporte con motivo.
6. **Conversión:** Calendly sigue siendo el único canal; no reintroduzcas formularios ni backend.
7. **i18n:** todo texto user-facing tiene su par EN/ES. Si tocas copy, tocas ambos idiomas.
8. **Marca:** respeta tokens (lime `#99CC33`, navy `#0A0E26`), Inter y gradientes. Cambia uso/composición, no
   inventes paleta ni cambies el logo.
9. **Dependencias:** no añadas paquetes pesados nuevos. Todo paquete nuevo va con versión **exacta pinneada**
   (sin `^`/`~`), entrada en el reporte (nombre, versión, motivo), `npm audit` verde tras instalar, sin
   scripts `postinstall`, y `package-lock.json` en el **mismo** commit. Trabaja con Astro, CSS y el JS
   existente; reusa Playwright (ya instalado) antes que añadir parsers.
10. **No fabricar hechos verificables** (§3 carve-out). Prohibido emitir schema `Review`/`AggregateRating` sin
    reviews verificables.

---

## 8. GATES — DEFINICIÓN DE HECHO

### 8.A GATES DUROS (emitidos por script → `_qa/iteration-NN/gates.json`, valores medidos)

Corre `node tools/qa/gates.mjs`; el script deriva el número de páginas esperado de `dist/` (no lo hardcodea).
- **0 overflow horizontal** en todas las rutas × 6 viewports × EN/ES.
- **0 violaciones axe serious/critical**; contraste AA.
- **0 requests ≥400** (same-origin/localhost).
- **0 errores de consola** fuera de allowlist (`calendly.com`, `plausible.io`, `ytimg`, `net::ERR_*_BLOCKED`).
- **`npm run build` exit 0** (los warnings se listan, no bloquean).
- **`npm run check` — ratchet: 0 errores NUEVOS vs baseline (≈69)**, baseline registrado en `gates.json`.
- **`href="#"` fuera de allowlist = 0.** Allowlist de selectores: `[data-calendly-trigger]`,
  `[data-lang-switcher]` (añadir una entrada = commit propio con justificación).
- **Touch targets ≥44×44** para controles **no-inline** (se excluyen links dentro de flujo de texto, como WCAG).
- **`grep -r "new.senaviacorp" src/ public/`** solo con hits en los 3 archivos documentados
  (`src/data/site.ts`, `astro.config.mjs`, `public/robots.txt`) — tras centralizar el `data-domain`. (No
  grepear `dist/`: todo el HTML construido contiene el dominio literal por diseño; para `dist/` basta un
  spot-check de que los canonicals coinciden con `SITE.url`.)
- **JSON-LD** (`node tools/qa/schema-audit.mjs`): `JSON.parse` de cada `ld+json` sin errores + completitud por
  tipo (BlogPosting: headline+datePublished+author+image; Service: name+description+provider; LocalBusiness:
  NAP idéntico a `site.ts` + geo; BreadcrumbList en páginas ≥2 niveles). Sitemap diff vs `dist/` con las
  exclusiones intencionales de `astro.config.mjs` en whitelist (`terms`, `privacy`, `404`, `brand-foundation`,
  `_source`).
- **Presupuestos de performance** (Lighthouse pinneado + fallback Playwright): Performance ≥90, LCP <2.5s,
  CLS <0.1, TBT ≤200ms (o aproximado/omitido en fallback), ninguna imagen >250–300 KB, transferencia inicial
  <1–1.5 MB sin contar el video hero. **Nota esperada, no falso positivo:** con `imageService:false`,
  `bg.webp` y `og-default.webp` (~1.5 MB c/u) **hoy fallan** el budget → optimizarlos en disco en `/public`
  es parte del trabajo. Baseline = primera iteración; ningún score termina por debajo del baseline. En
  localhost el mobile Lantern puede reportar `NO_LCP` con video hero y capar Performance (~92): si ocurre,
  documéntalo como excepción con la medición desktop y el LCP real observado.
- **Seguridad:** 0 secretos (valores de vars NO-`PUBLIC_`) en repo, historial y `dist/`; 0 archivos ajenos en
  `public/` **sin justificar/aprobar**; 0 vulns high/critical sin excepción documentada; headers de seguridad
  intactos (diff `vercel.json` vs `main`).
- **GEO/AEO:** `public/llms.txt` presente (empresa, servicios con URLs, NAP, área de servicio, Calendly);
  `FAQPage` válido en pricing y las service pages (reusar el patrón ya implementado en
  `services/web-design/[slug].astro`).

### 8.B GATES DE JUICIO (rúbrica binaria, evaluada por el agente revisor independiente — PASS/FAIL por ítem)

- Exactamente **un H1** por página; jerarquía sin saltos.
- CTA above-the-fold visible en 390px.
- Hero con **media real** (no placeholder).
- **Grep de texto RENDERIZADO** (innerText vía Playwright, case-sensitive, whole-word):
  `lorem|placeholder|TODO|coming soon` = 0 (allowlist: el fallback intencional `#calendlyFallback`).
- Line-length cómoda (45–85 caracteres).
- **Móvil impecable:** checklist §4-lente-1 completo, EN y ES, en todas las rutas.
- **i18n completo** en páginas core (home, services ×N, about, contact, pricing); el switcher nunca promete un
  ES que no existe.

Lo no medible ("se siente premium") se degrada a **advisory** en `_qa/DESIGN-NOTES.md` para el dueño y **no
bloquea el cierre**. Se elimina "idéntico al diseño" (no hay referente).

### 8.C PRESUPUESTO Y EXCEPCIONES

- **Máx 4–6 rondas** completas del bucle FASE 1→3.
- Si un gate sigue rojo tras **2 intentos** con análisis de causa raíz → `_qa/EXCEPTIONS.md` (formato: gate,
  evidencia, intentos, por qué no es alcanzable, propuesta concreta para el humano, riesgo de dejarlo así).
- Un **defecto individual** deferred → `_qa/BLOCKERS.md` (defecto, 2 intentos, causa raíz hipotetizada) y
  **CONTINÚA** — un defecto jamás detiene la sesión.
- Si tras la última ronda quedan **P0** → escribe `_qa/BLOCKED.md` (marcador terminal, opciones, qué decisión
  humana falta) y PARA.
- **Relajar, reinterpretar o eliminar un gate sin registrar la excepción es un FALLO del run.**
- Los **P2 remanentes** van a la sección BACKLOG del FINAL-REPORT con ruta y evidencia.

---

## 9. ENTREGA

- Deja la rama **`feat/finish-site`** con commits temáticos por lote verificado, lista pero **sin mergear**.
  Escribe la descripción de PR en `_qa/PR-DESCRIPTION.md`. El **merge y el push los hace el humano.**
- `_qa/` (gitignored) con las iteraciones, baseline, `FINAL-REPORT.md`, `EXCEPTIONS.md`, `BLOCKERS.md`,
  `DECISIONS-NEEDED.md`, `DESIGN-NOTES.md`. El `FINAL-REPORT.md` **embebe** las discrepancias, excepciones,
  backlog y decisiones (porque los `.md` de `_qa/` no viajan con el merge).
- **Mensaje final al usuario (en español)** — debe inline (no solo en `_qa/`, que es efímero):
  1. Gates cumplidos, nº de iteraciones, qué se terminó/rediseñó por área, decisiones de diseño/contenido.
  2. **Comando para rehabilitar el push:**
     `git remote set-url --push origin https://github.com/Senavia-Corp/senavia-corp-website.git`
  3. **Swap de dominio pre-deploy (acción humana obligatoria):** cambiar el dominio en los **3 archivos
     documentados** (`src/data/site.ts` — `domain` Y `url` —, `astro.config.mjs`, `public/robots.txt`) +
     actualizar la propiedad en el dashboard de **Plausible**, luego `npm run build`.
  4. **⚠️ Rotar el token de Sanity:** hay un `SANITY_API_TOKEN` en texto plano en
     `scripts/migrate-to-sanity.mjs:10` (mismo valor que `.env.local`), trackeado en el historial de git.
     Rotarlo en la consola de Sanity es acción humana; este run no puede ni debe hacerlo.
  5. EXCEPTIONS + BACKLOG (P2) + DECISIONS-NEEDED + borradores de contenido pendientes de aprobación.
  6. Recordatorio: **mergear a `main` dispara auto-deploy en Vercel** — publicar es una decisión consciente del
     humano.

---

## 10. PRINCIPIOS

Evidencia, no suposiciones (un defecto existe si se ve en una captura o lo mide una herramienta; un fix sirve
si la re-captura lo confirma) · **el repo gana sobre este documento** · causa raíz sobre parche · móvil
primero · auditar todo antes de tocar nada · propiedad exclusiva de archivos · verificar a ciegas (nadie
aprueba su propio trabajo) · **no fabricar hechos verificables** · **evidencia reproducible** (comando+salida
o captura+criterio) · **no relajar gates en silencio** · una sola dirección de arte · "se ve casi bien" NO
pasa · termina TODO · y **bajo ninguna circunstancia hagas deploy** (ni `git push`, ni merge a `main`).

---

## APÉNDICE A — SNAPSHOT del 2026-06-12 (hipótesis orientativa, NO lista de tareas)

> Estos números eran ciertos el 2026-06-12 y probablemente ya no lo son. **Úsalos como pista, nunca como
> hechos.** El inventario real lo genera la FASE 0 (`inventory.json`) desde el build. Si algo aquí contradice
> el repo, gana el repo y se registra en `DISCREPANCIES.md`.

- "18 páginas" → hoy ≈ **100** en `dist/` (subservicios, service-areas, posts y casos desde Sanity).
- "services/digital-marketing" → renombrado a **traffic-generation** (301 en `vercel.json`).
- "blog en `src/content/blog/*.mdx`" → **no existe**; el contenido vive en **Sanity `zx255dw6`**.
- "57 links muertos / 58 placeholders" → cifras pre-migración; hoy `href="#"` ≈ **30**, y los placeholders son
  fallbacks CMS + menciones textuales.
- "`_qa/audit.mjs` ya existe" → **no existe**; la FASE 0 lo reconstruye en `tools/qa/`.
- Marquee de logos (Pergola Plus, Lake Scaping, AB Aluminum, ANGELE GLOW, Mr. & Mrs., GQM, Orchid Roofing,
  Sunline Pools), casos reales (angele-glow, pergola-plus-florida) → **confírmalos contra Sanity**, no asumas.
- Material extra sin usar en la carpeta Webflow original (`/Users/senavia/Desktop/senavia-7d2deb.webflow (3)/`)
  → puede estar en iCloud como "0 B"; materializa con `cat "<archivo>" > /dev/null` y verifica `stat -f%z > 0`
  antes de copiar.

---

## APÉNDICE B — SPEC DEL HARNESS (`tools/qa/`)

**`tools/qa/audit.mjs <NN> [--routes=/a,/b] [--full]`** (Playwright + @axe-core/playwright):
- **Descubrimiento de rutas:** `npm run build` fresco → `dist/**/*.html` + `dist/sitemap-*.xml`. Fallback sin
  red: `dist/` existente + `getStaticPaths`.
- **Viewports:** `[360, 390, 768, 1280, 1440, 1920]`. **Idiomas:** EN (default) y ES sembrado con
  `await context.addInitScript(() => localStorage.setItem('senavia.lang','es'))` **antes** de `page.goto`.
- **Servir el sitio:** `npm run preview` (para replicar headers de `vercel.json` en checks de CSP, sirve
  `dist/` con un pequeño server que inyecta los headers de `vercel.json`, ya que `astro preview` no los aplica).
- **Checks por (ruta,viewport,lang):** overflow (`document.scrollWidth > innerWidth`), errores de consola
  (filtrados por allowlist), requests con `response.status() >= 400` (same-origin), axe `wcag2aa`
  serious/critical, captura full-page → `_qa/iteration-NN/shots/<ruta>__<vp>__<lang>.png`.
- **Allowlist de consola:** `['calendly.com','plausible.io','ytimg','net::ERR_BLOCKED_BY_CLIENT',
  'net::ERR_*_BLOCKED']`.

**Esquema `results.json`:**
```json
{
  "iteration": "NN",
  "generatedFrom": "dist",
  "routes": ["/","/about", "..."],
  "results": [
    { "ruta":"/", "viewport":390, "lang":"es",
      "overflow": false, "scrollWidth": 390,
      "consoleErrors": [], "requests4xx5xx": [],
      "axe": { "serious": 0, "critical": 0, "violations": [] },
      "shot": "shots/index__390__es.png" }
  ],
  "summary": { "overflowCount":0, "axeSerious":0, "axeCritical":0, "req4xx5xx":0, "consoleErrors":0 }
}
```
(El diff numérico anti-regresión de §6 compara `summary` y `results[]` contra la iteración anterior.)

**`tools/qa/gates.mjs`** → `_qa/iteration-NN/gates.json`: mide cada gate DURO de §8.A y emite
`{ gate, valor_medido, umbral, pass, comando, salida_literal }`. Deriva el conteo de páginas de `dist/`.

**`tools/qa/schema-audit.mjs`** → valida JSON-LD (parse + completitud por tipo) y el sitemap diff.

**Deps a añadir (devDependencies, pinneadas):** `lighthouse@12` (si se corre local; o vía `npx`), y
`pixelmatch`+`pngjs` solo si se activa el pixel-diff. Todo lo demás reusa Playwright ya instalado.

---

## APÉNDICE C — TRAZABILIDAD DE LAS 23 MEJORAS (checklist de cobertura)

| # | Propuesta | Dónde queda en v2 |
|---|---|---|
| 1 | FASE 0 bootstrap del harness | §2.3, APÉNDICE B |
| 2 | Inventario real, snapshot → hipótesis | §1, §2.4, APÉNDICE A, §10 (repo gana) |
| 3 | Auditoría read-only + GATE G1 | §4 (regla read-only), GATE G1 |
| 4 | "NO deploy" real: prohibir push/merge | §2.1 (guardrail), §7.1, §9 (revert + aviso) |
| 5 | Agente Seguridad (8ª lente) | §4 lente 8, §8.A (seguridad) |
| 6 | Reglas de secretos / Sanity read-only | §7.2, §4 lente 8, §9.4 (rotar token) |
| 7 | Contrato de artefactos + estado persistente | §4 (contrato JSON), `_qa/STATE/*` |
| 8 | Ownership exclusivo, hot files, sin worktrees | §5 (concurrencia/ownership/commits) |
| 9 | Verificación ciega | §6, GATE G1(b), cierre de gates |
| 10 | Anti-regresión: baseline + re-run completo | §2.3 (calibración), GATE G1(d), §6 |
| 11 | Gates computables + allowlists mecánicas | §8.A / §8.B, APÉNDICE B (gates.mjs) |
| 12 | Presupuesto de iteraciones + excepciones | §0 (2 estados), §8.C |
| 13 | Prohibido fabricar testimonios | §3 carve-out, §4 lente 3, §5 (veracidad), §7.10 |
| 14 | Archivos congelados + manifiesto contenido | §7.3, §7.5, GATE G1(d) |
| 15 | SEO técnico apunta a staging (dominio) | §1, §5 (centralización), §8.A (grep), §9.3 |
| 16 | Agente SEO + validación JSON-LD | §4 lente 8→SEO integrado, §5 (fix blog), §8.A (schema) |
| 17 | Sanity fuente de verdad, no MDX | §1, §5 (estrategia de contenido) |
| 18 | Performance con herramienta + budgets | §4 lente 7, §8.A (budgets) |
| 19 | Decisión i18n-SEO antes de traducir | §5 (Opción A default / B backlog) |
| 20 | Política de terceros y embeds | §5 (embeds), §7.3 (CSP), §4 lente 8 |
| 21 | Supply chain con gate + pinning | §7.9, §4 lente 8 (audit); se descarta "quitar @sanity/client" |
| 22 | GEO/AEO (llms.txt + FAQPage) | §4 lente 8→SEO, §8.A (GEO/AEO) |
| 23 | Arranque idempotente y reanudación | §2.2 |
