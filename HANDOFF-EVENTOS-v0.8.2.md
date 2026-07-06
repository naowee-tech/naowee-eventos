# 🤝 HANDOFF — Naowee **Eventos** (ministerio / light) · v0.8.2

> Documento semilla para **arrancar un chat nuevo de Eventos** sin re-derivar contexto.
> Adjúntalo (@) al iniciar. Fecha de corte: 2026-07-06 · versión en producción: **v0.8.2**.

---

## 1. Identidad del proyecto
- **Qué es:** demo/prototipo del módulo **Eventos "light"** (SUID · Ministerio del Deporte). HTML/CSS/JS **vanilla**, sin build tools, fuentes Google Inter. Todo entra por **cargue** (manual o masivo); el grueso es reportería.
- **Repo:** `naowee-tech/naowee-eventos` (rama **main**). **Pages:** https://naowee-tech.github.io/naowee-eventos/
- **Local:** `/Users/dvargas/Desktop/Eventos/demo` (es la raíz git).
- **Correr local:** preview MCP → server name **`eventos-demo`**, puerto **4310** (`.claude/launch.json`). URLs tipo `http://localhost:4310/cargue.html?id=EV-2026-001&role=GESTOR`.
- **Alcance LIGHT (NO re-proponer):** sin fases/etapas, sin cupos, sin documentación por fase, sin acreditaciones, sin digitación en vivo, sin delegaciones self-service, sin constructor de formularios. Eso es el producto pesado (Intercolegiados/GM) que Naowee le vende a Comité.

## 2. Cómo trabajar (Protocolo Naowee — OBLIGATORIO)
- Al crear/refinar UI Naowee: **invocar skill `naowee-build` primero** (carga DS + patrones + demos). Cargar también skills de módulo (`naowee-eventos`, `naowee-design-system`, `naowee-patterns-ux`, `naowee-sidebar-shell`, etc.).
- **Componentes canónicos únicamente** (`.naowee-*`): botones (`--loud/--ghost/--link/--sm`), `.naowee-textfield`, `.naowee-dropdown`, `.naowee-segment`, `.naowee-tabs`, `.naowee-table--in-card`, `.naowee-message` (`--caution/--informative/--negative`), `.naowee-badge`, `.naowee-searchbox`, `.naowee-datepicker`, `.naowee-file-uploader`. **NO inventar** clases paralelas; si falta algo usar override pattern (inline `<style>` DESPUÉS del DS). El botón loud NO oscurece en hover.
- **Verificar en navegador** (preview screenshot + consola sin errores). **Dropdowns/menús: verificar por SCREENSHOT, nunca por medición `eval`** (da valores falsos por la transición).
- **Versionado:** `MODULE_VERSION` es CONSTANTE MANUAL en `shared/naowee-footer.js` (subirla en cada release + changelog). **Cache-busters**: `naowee-footer.js?v=X.Y.Z` en las 11 páginas → bump con
  `sed -i '' -E 's#(naowee-footer\.js\?v=)[0-9.]+#\1X.Y.Z#' *.html`.
- **Git:** commit/push **solo cuando Doug lo pida** ("push"/"pushea"). Rama main directo (convención del repo). Mensajes `type(scope): desc vX.Y.Z`, sin `Co-Authored-By` (atribución off).

## 3. Arquitectura / capa de datos (clave para no romper nada)
Módulos ES en `shared/`, importados sin `?v=` (grafo de módulos). Persistencia en **sessionStorage** (se pierde al cerrar pestaña — OK para demo).

**`shared/events-data.js`** (fuente de verdad):
- `EVENTS` (semilla) · `getDrafts()`/`addDraft()` · `getOverrides()`/`updateEvent(id, patch)` (merge de edición) · `allEvents()` = drafts + EVENTS con overrides + **deltas de cargue**.
- **Deltas** (`applyUpload(id, 'insc'|'res'|'med', n)`, `getCargueDeltas`) → contadores agregados por evento (key `naowee-eventos-cargue-deltas`).
- **Historial** (`addUploadRecord`/`getUploadHistory`) — auditoría por evento.
- **Versiones de archivo** (`addFileVersion(id, tipo, {fileName,n,modeLabel,timestamp,columns,rows})` / `getFileVersions`) key `naowee-eventos-cargue-files` — "Archivos cargados".
- **ROSTER (inscritos, verdad de participantes)** key `naowee-eventos-roster`: `getRoster` · `addInscritos(id, list)` (dedup por doc+deporte) · `removeInscrito(id, athleteId)` + `getRemovedInscritos` (key `...-roster-removed`). **REGLA:** inscripción ESCRIBE al roster; ranking/medallería LEEN de él.
- **Calendario organismo** (`getOrganismoCal`/`saveOrganismoCal`/`organismoEventsForCalendar`).

**`shared/roster-data.js`**: `effectiveRoster(ev)` = inscritos en vivo (getRoster) **+** roster sintetizado coherente con el deporte del evento (para que los eventos precargados no arranquen vacíos; evento con `insc.done=0` → roster vacío), **menos** los removidos. Cada sintetizado trae deporte, **prueba**, **organización (liga variada)**, depto. RNG determinista por `ev.id`.

**`shared/catalogo.js`**: `DEPORTES_POR_TIPO = { Individual:[…], Conjunto:[…], Paradeporte:[…] }`, cada deporte `{ id, label, emoji, pruebas:[] }`. Cascada **Tipo → Deporte → Prueba** (el "deporte" = la disciplina). `DEPARTAMENTOS`, `MUNICIPIOS_POR_DEPTO`, `MODALIDADES`.

**`shared/reporteria-data.js`**: `buildReporteria(ev)` sintetiza tableros (inscripciones/resultados/medallería, podio, medallero por organismo) con RNG por id.

**Otros shared:** `sidebar.js` (mountSidebar/Header/Backdrop/DemoSwitcher, `getRoleFromQuery`, `homeForRole`, ROLES), `naowee-footer.js` (footer pill + versión + toast `#evToast` canónico), CSS: `tokens.css`, `shell.css`, `list-components.css`, `event-detail.css`, `forms.css`, `naowee-footer.css`.

## 4. Mapa de páginas (`*.html`)
- **dashboard.html** — analítica (widgets; orden: Próximos eventos banner → Eventos por estado → … → Inscripciones agregadas).
- **eventos.html** — lista de eventos (grid/lista/calendario), filtros, progreso por conteos.
- **evento-crear.html** — crear evento (nombre, fechas, lugar, gestor) + **toggle Nacional/Internacional** (internacional: sin depto/municipio).
- **evento-detalle.html** — detalle + meta-strip (5 cols incl. Alcance) + **edición** (modal; respeta alcance) + **catálogo deportivo** (Deportes y competencias) + **Organizaciones invitadas** (nacional; confirmación al quitar) + seguimiento.
- **cargue.html** — el grueso: tabs **Inscripciones / Ranking·Resultados / Medallería**, cada uno **Masivo** (plantilla .xlsx real vía SheetJS + validación real por fila) y **Manual**. (Detalle en §6.)
- **calendario.html** — calendario del organismo (crear evento liviano; ADMIN super-admin puede fechas pasadas).
- **reporteria.html** — 3 tableros por evento.
- **perfil.html / perfil-detalle.html / perfil-v3.html** — consulta/perfil del deportista (trazabilidad).
- **usuarios.html** — gestión de usuarios (ADMIN).

## 5. Roles y demo
4 perfiles vía `?role=`: **USER** (usuario del módulo, lectura), **ADMIN** (Carlos Restrepo, administrador), **GESTOR** (Andrea Salas, hace cargues), **ORGANISMO** (Diego Ospina, calendario). Cambio de perfil = **full reload** por `?role=` (pill flotante "Cambiar perfil"). Guards por página (`homeForRole`). RBAC: solo GESTOR/ADMIN llegan a cargue.

## 6. Estado de `cargue.html` (lo más iterado)
- **Masivo:** descargar plantilla (SheetJS genera .xlsx real con `TEMPLATE_COLS[tipo]`) → subir → **validación real** (`validateUpload`: encabezados normalizados, requeridos, email/número por fila con nº de fila) → carga parcial (válidas) → `renderResults` → `commitUpload` (persiste + `addInscritos` en inscripción). Errores de estructura/vacío → `.naowee-message--caution`.
- **Manual Inscripciones:** "Inscripción individual" (buscar SUID sobre `MOCK_ROWS.inscripciones.valid`, o "Registrar nuevo deportista"). **SIN cola/borrador** → registrar abre **`confirmDialog`** (modal) → `inscribeOne` (directo al roster). Form: tipo/nro doc, sexo, nombres, **Deporte→Prueba (cascada)**, **Organización (nacional, obligatorio)**, Departamento (opcional), **Correo (obligatorio)**. Debajo, **"Deportistas inscritos"** (`mountInscritosPanel`, reemplaza "Archivos cargados"): filtros deporte·competencia·búsqueda + **eliminar** por fila (confirmación → `removeInscrito`).
- **Manual Ranking (`renderManualGrid`):** buscador + paginador (6/pág), estado por fila, inputs posición/marca; **no permite posiciones repetidas por competencia** (deporte+prueba → marca rojo + aviso + bloquea Guardar). Persiste vía addFileVersion, evita doble-guardado.
- **Manual Ranking INTERNACIONAL (`renderManualRankingIntl` + drawer en `<body>`):** lista de colombianos → drawer derecho: posición/marca del colombiano + podio ficticio (país+nombre+marca 1-3), pre-carga Colombia si quedó 1-3, Editar repobla sin re-sumar.
- **Manual Medallería (`renderManualMedalleria`):** buscar deportista → medalla 🥇🥈🥉 en su competencia; **"Medallero por organización" EN VIVO** (se calcula solo); aviso conjunto; persiste vía addFileVersion.
- Toast = `#evToast` canónico neutro (sin colores inventados). `setupDropdown` soporta opts como **función** (cascadas) + `reset()`.
- **Código muerto pendiente de limpiar:** `renderQueue`/`addToQueue`/`commitQueue`/`inscQueue` (cola vieja) ya no se usan.

## 7. Los 6 accionables reunión 25-jul → **TODOS aplicados (v0.8.1/0.8.2)**
1. Disciplina/Prueba en inscripción (masiva+manual). 2. Vista Inscritos (lista+filtros, reemplaza Archivos cargados). 3. Buscador Organizaciones + correo obligatorio (nacional). 4. Flujo sin borrador → modal de confirmación. 5. Eliminar inscripciones (ícono+confirmación). 6. Ranking sin posiciones duplicadas.

## 8. Pendientes
**Negocio (Danna/Vanessa) — NO implementar sin definición:**
- **Grupos / deportes de conjunto:** medalla de equipo es UNA, no N; "crear resultado de equipo sin inscripción previa, asociar participantes después". Hoy solo hay mitigación (aviso conjunto en medallería). *Es el gran pendiente.*
- Visibilidad por rol (¿admin ve todo el país? ¿organización solo lo suyo?), multi-organización (Naowee usa el módulo también), login propio del organismo, paradeporte sin clasificación funcional, API pública del calendario.
**Dev/demo:**
- Limpiar código muerto de la cola (§6). SUID: el nuevo registrado no entra al universo global buscable (`MOCK_ROWS`), solo al roster del evento. Persistencia solo en sessionStorage (se pierde al recargar). Backend real: validación masiva vía S3 (mencionado en reunión, fuera de la demo).

## 9. Insumos / reuniones (para contexto)
- Transcripciones (Gemini) en `~/Downloads/`: `Eventos ministerio_ 2026_06_25 … Notas de Gemini.md` (entrega dev) y `2do entregable SUID Eventos - 2026_07_03 … Recording.mp4` (revisión). Discovery: `~/Desktop/Eventos/Reunión presencial-entrega eventos SUID_ 2026_06_01 …`.
- Docs de trabajo en `~/Desktop/Claude-Doug/`: `EVENTOS-ALCANCE-TOTAL.md`, `EVENTOS-INDEX.md`, `ACCIONABLES-NEGOCIO-EVENTOS.md`, `CHECKLIST-JUANMA-EVENTOS.md`, `PLAN-MEJORAS-EVENTOS-v0.7.md`.
- Personas: **Danna** (PM), **Andrea** (producto), **Diego** (analítica/reportería), **Juanma** (líder técnico), **Kenneth** (backend), **César Pabuena** (≈"Javi", dev), **Juani** (producto). Equipo dev: Kenneth (lidera), Ema, Pizarro; Daniel Castillo (frontend).

## 10. Changelog resumido
v0.6.x reportería + refinamientos UI · v0.7.0–0.7.5 feedback Juanma (conteos, nacional/internacional, catálogo en edición, medallería rediseñada, quick-wins) · v0.7.6–0.7.7 refinamiento edición + cargue masivo real (SheetJS) + roster por evento · **v0.8.0** cierre de huecos (medallero por org en vivo, persistencia, drawer internacional, modal editar respeta alcance, confirmación quitar org) · **v0.8.1** #1 prueba/disciplina · **v0.8.2** #2–#6 (vista inscritos, organizaciones, modal sin cola, eliminar, dedup ranking).

## 11. Para arrancar el chat v0.2
Invoca `naowee-build`, lee este handoff + `cargue.html` completo antes de tocarlo. Verifica en preview (server `eventos-demo`:4310). No pushees sin que Doug lo pida.
