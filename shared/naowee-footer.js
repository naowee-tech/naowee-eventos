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
   + se quita el disco/medalla sobre el avatar (redundante con el nº del pedestal). */
const MODULE_VERSION = 'v0.6.7';

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
