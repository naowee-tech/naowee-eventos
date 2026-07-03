/* ═══════════════════════════════════════════════════════════════
   NAOWEE EVENTOS — Footer flotante canónico (mount + scroll-hide)
   Formato canónico (paridad naowee-ivc / Project v2.0.3):
     [logo naowee] | Todos los derechos reservados © 2026 | Eventos v0.1.0
   La versión va en ROJO/accent. Scroll-hide: el host de scroll real es
   .page (creado por el shell) y el evento scroll NO bubblea — por eso
   escuchamos en capture sobre document. Patrón DESIGN-PATTERNS §3.8.
   ═══════════════════════════════════════════════════════════════ */

const MODULE_NAME = 'Eventos';
/* Versión del módulo mostrada en la pill del footer. Es una CONSTANTE: hay que
   subirla aquí en cada release (no se deriva sola — por eso se mantenía en 0.3.0).
   v0.4.0 = vista Calendario (estilo Google Calendar) + eventos del organismo
   reflejados + refinamientos de formularios/modales.
   v0.6.0 = Reportería por evento (3 tableros de Diego: Inscripciones · Resultados
   · Medallería) + dashboard adelgazado a vista ejecutiva + RBAC del cargue.
   v0.6.1 = refinamiento UI Reportería: cards planas (sin sombra), tabs+filtros en
   gran container canónico, dropdowns .naowee-dropdown + botones DS en filtros.
   v0.6.2 = container sin canvas gris, "Limpiar" --ghost (disabled hasta filtrar),
   back canónico --ghost con chevron izquierdo.
   v0.6.3 = tabs con padding (no pegados), podio rediseñado (corona/medallas
   metálicas/pedestal con brillo), tablas → card-table canónica (.naowee-table-card),
   fix datos (atletas únicos + marcas monótonas).
   v0.6.4 = padding-top en tabs, GAP entre cards del panel (.rep-panel flex/gap),
   podio 3D (cara superior con perspective) + números sin sombra.
   v0.6.5 = podio ISOMÉTRICO completo (3 caras planas: frontal + superior + lateral,
   skew) estilo low-poly.
   v0.6.6 = podio look premium Dribbble: caras en gradiente (glossy), esquinas
   redondeadas, profundidad 16px y sombra de contacto suave (en el bloque, no en
   el número).
   v0.6.7 = podio: esquinas crispas (sin radius en caras skew → quita el artefacto)
   + se quita el disco/medalla sobre el avatar (redundante con el nº del pedestal).
   v0.6.8 = modal editar evento: notes (caution lock + finalizado) → .naowee-message
   canónico del DS (antes era .ev-modal__note bespoke).
   ── v0.7.x: feedback sesión de entrega a desarrollo (25-jun) ──
   v0.7.0 = progreso → conteos numéricos (insc·res·med, no %); "Ver analítica" por
   fila en eventos; "Perfil del deportista" → "Consulta deportistas"; ranking manual
   sin columna FASE.
   v0.7.1 = evento Nacional/Internacional: toggle (segmento) en crear evento — en
   internacional el lugar (depto/municipio) no aplica + nota; alcance persistido y
   mostrado como chip en el detalle (no editable).
   v0.7.2 = ranking/resultados INTERNACIONAL: si el evento es internacional, el
   cargue manual de ranking muestra la lista de colombianos + un drawer lateral
   para registrar su posición/marca y crear el podio de "ficticios" (país + nombre
   + marca). Evento demo EV-2026-010 marcado internacional.
   v0.7.3 = catálogo deportivo + organizaciones en la EDICIÓN (evento-detalle):
   secciones "Deportes y competencias" (deporte+competencias en chips) y
   "Organizaciones invitadas" (solo nacional), editables por ADMIN, persistidas.
   v0.7.4 = medallería manual rediseñada: buscar deportista → asignarle medalla
   (🥇🥈🥉) en su competencia (antes era por departamento); el medallero por
   organismo se calcula solo. + fix ícono gigante en heads de cargue.
   v0.7.5 = lote de quick-wins (feedback Juanma): (1) carga masiva por
   organización — columna "Organización" en las 3 plantillas + hint; (2) ranking
   manual con BUSCADOR (deporte/nombre) + PAGINADOR (6/pág) y estado por fila;
   (3) departamento OPCIONAL en inscripción manual (por extranjeros); (4) reorden
   dashboard — Próximos eventos como banner superior + Eventos por estado arriba,
   Eventos por mes conservado, Inscripciones agregadas al final con alcance
   aclarado; (5) calendario: super-admin (ADMIN) puede registrar eventos con
   fecha pasada (migración) — datepicker future-only para organismo + nota.
   v0.7.6 = refinamiento UI edición (evento-detalle, feedback Doug): (1) meta-strip
   de la cabecera a 5 columnas en desktop — 'Organismo' ya no queda huérfano bajo
   'Fecha de inicio' (se desbordaba desde que v0.7.1 agregó 'Alcance'); (2) fix
   dropdowns que salían por detrás de
   la card siguiente — la sección con el dropdown abierto se eleva (z-index) y el
   menú usa el z-index canónico (999); (3) CTA 'Agregar deporte'/'Invitar' e input
   a la altura del dropdown (--field-h 48px); (4) cada deporte es un acordeón
   colapsable (chevron + contador .naowee-badge) — ya no vuelca todas las
   competencias al agregarlo; (5) aviso de quitar organización → .naowee-message
   --caution canónico (antes era un <p> sin estilo); (6) "Agregar deporte" e
   "Invitar" arrancan disabled hasta que se elige deporte / se escribe nombre;
   (7) ranking internacional: botón "Registrar resultado" usaba .naowee-btn--outline
   (inexistente en el DS) → --ghost canónico; el drawer se monta en <body> para que
   position:fixed cubra el viewport + overlay (antes quedaba atrapado por un
   ancestro con transform); (8) toast: se quita el override verde/rojo inventado en
   flash() — usa el #evToast canónico (pill neutro del naowee-footer.css);
   (9) cargue masivo REAL (feedback Gustavo): se parsea el .xlsx subido con SheetJS
   y se valida de verdad contra TEMPLATE_COLS (encabezados + requeridos vacíos +
   formato email/número) — ya no inventa errores hardcodeados; archivo vacío / sin
   filas / estructura incorrecta → mensajes reales. "Descargar plantilla" genera un
   .xlsx real con los encabezados oficiales (antes era un link roto). (10) el × de
   quitar archivo deja de ser naranja (neutro, rojo al hover). */
const MODULE_VERSION = 'v0.7.7';

(function () {
  function mount() {
    if (document.querySelector('.naowee-footer')) return;
    const year = new Date().getFullYear();
    const el = document.createElement('div');
    el.className = 'naowee-footer';
    el.setAttribute('role', 'contentinfo');
    el.setAttribute('aria-label', 'Pie de página Naowee');
    el.innerHTML = `
      <img src="shared/logos/naowee.svg" alt="Naowee" class="naowee-footer__logo" onerror="this.style.display='none'"/>
      <div class="naowee-footer__sep"></div>
      <span class="naowee-footer__text">Todos los derechos reservados <strong>&copy; ${year}</strong></span>
      <div class="naowee-footer__sep"></div>
      <span class="naowee-footer__version" aria-label="Versión del módulo: ${MODULE_NAME} ${MODULE_VERSION}">
        ${MODULE_NAME} <strong>${MODULE_VERSION}</strong>
      </span>`;
    document.body.appendChild(el);
    setupScrollHide(el);
  }

  function setupScrollHide(footer) {
    let lastY = null;
    /* Capture phase sobre document: el scroll de .page no bubblea. */
    document.addEventListener('scroll', (e) => {
      const target = e.target;
      const y = (target && typeof target.scrollTop === 'number')
        ? target.scrollTop
        : (window.scrollY || window.pageYOffset || 0);
      if (lastY === null) { lastY = y; return; }
      const dy = y - lastY;
      if (Math.abs(dy) < 60 && y > 0) { return; } // threshold 60px (scroll down>60 oculta)
      if (dy > 0 && y > 60) footer.classList.add('is-hidden');
      else footer.classList.remove('is-hidden');
      lastY = y;
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
