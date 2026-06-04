/* ═══════════════════════════════════════════════════════════════
   NAOWEE EVENTOS — Datos mock compartidos (6 eventos del Ministerio)
   Mismo set que el dashboard (paridad visual y de contenido). Compartido
   por la lista "Eventos" (eventos.html) y la creación (evento-crear.html,
   que hace "push" del nuevo borrador a este array en sessionStorage para
   que aparezca al volver a la lista).
   ═══════════════════════════════════════════════════════════════ */

export const EVENTS = [
  {
    id: 'EV-2026-001', emoji: '🏆', name: 'Juegos Intercolegiados Nacionales 2026',
    sport: 'Multideporte · 14 disciplinas', place: 'Bogotá D.C.', org: 'Ministerio del Deporte',
    start: '15 jun 2026', end: '28 jun 2026', status: 'activo',
    insc: { done: 2840, total: 3200 }, res: { done: 410, total: 1200 }, med: { done: 38, total: 420 }
  },
  {
    id: 'EV-2026-002', emoji: '🏃', name: 'Festival Departamental de Atletismo',
    sport: 'Atletismo · Pista y campo', place: 'Medellín, Antioquia', org: 'Indeportes Antioquia',
    start: '03 jul 2026', end: '06 jul 2026', status: 'activo',
    insc: { done: 612, total: 640 }, res: { done: 188, total: 320 }, med: { done: 0, total: 96 }
  },
  {
    id: 'EV-2026-003', emoji: '🏊', name: 'Copa Nacional de Natación',
    sport: 'Natación · Piscina olímpica', place: 'Cali, Valle del Cauca', org: 'Federación Colombiana de Natación',
    start: '18 ago 2026', end: '22 ago 2026', status: 'borrador',
    insc: { done: 0, total: 0 }, res: { done: 0, total: 0 }, med: { done: 0, total: 0 }
  },
  {
    id: 'EV-2026-004', emoji: '⚽', name: 'Torneo Interligas de Fútbol Sala',
    sport: 'Fútbol Sala · Conjunto', place: 'Barranquilla, Atlántico', org: 'Liga de Fútbol de Salón del Atlántico',
    start: '05 sep 2026', end: '12 sep 2026', status: 'borrador',
    insc: { done: 24, total: 64 }, res: { done: 0, total: 0 }, med: { done: 0, total: 0 }
  },
  {
    id: 'EV-2026-005', emoji: '🥋', name: 'Campeonato Nacional de Taekwondo',
    sport: 'Taekwondo · Combate', place: 'Pereira, Risaralda', org: 'Federación Colombiana de Taekwondo',
    start: '20 mar 2026', end: '23 mar 2026', status: 'finalizado',
    insc: { done: 480, total: 480 }, res: { done: 480, total: 480 }, med: { done: 144, total: 144 }
  },
  {
    id: 'EV-2026-006', emoji: '🏋️', name: 'Liga Nacional de Levantamiento de Pesas',
    sport: 'Halterofilia · Marca', place: 'Bucaramanga, Santander', org: 'Federación Colombiana de Pesas',
    start: '08 feb 2026', end: '10 feb 2026', status: 'finalizado',
    insc: { done: 210, total: 210 }, res: { done: 210, total: 210 }, med: { done: 63, total: 63 }
  }
];

export const STATUS_LABEL = { borrador: 'Borrador', activo: 'Activo', finalizado: 'Finalizado' };

export function pct(done, total) { return total > 0 ? Math.round((done / total) * 100) : 0; }

/* ═══════════════════════════════════════════════════════════════
   MODELO DE ASIGNACIÓN — Gestor ↔ Evento
   Fuente única compartida por eventos.html, evento-detalle.html y
   cargue.html (oversight). evento-detalle.html ya importa GESTORES
   de catalogo.js; aquí se centraliza el MAPA y los helpers.
   ═══════════════════════════════════════════════════════════════ */

/** Mapa determinístico: eventId → gestorId (base) */
export const GESTOR_MAP = {
  'EV-2026-001': 'g-marcela',
  'EV-2026-002': 'g-andrea',
  'EV-2026-003': 'g-andrea',
  'EV-2026-004': 'g-julian',
  'EV-2026-005': 'g-paola',
  'EV-2026-006': 'g-diego'
};

/**
 * Resuelve el gestorId de un evento (override > draft.gestorId > GESTOR_MAP).
 * @param {{ id: string, gestorId?: string }} ev
 * @returns {string|undefined}
 */
export function resolveGestorId(ev) {
  return ev.gestorId || GESTOR_MAP[ev.id];
}

/**
 * Devuelve los eventos asignados a un gestor concreto.
 * @param {string} gestorId  (ej. 'g-andrea')
 * @returns {Array} subset de allEvents()
 */
export function eventsForGestor(gestorId) {
  return allEvents().filter((ev) => resolveGestorId(ev) === gestorId);
}

/**
 * Resuelve el gestorId del rol GESTOR logueado (demo: siempre g-andrea / Andrea Salas).
 * Si en el futuro el sistema autentica personas reales, se pasa el claim aquí.
 * @param {string} roleCode
 * @returns {string|null}
 */
export function gestorIdForRole(roleCode) {
  if (roleCode === 'GESTOR') return 'g-andrea';
  return null;
}

/* Borradores recién creados en la demo (persisten en sessionStorage para
   que el flujo "Crear → Guardar → vuelvo a la lista" muestre el evento). */
const DRAFTS_KEY = 'naowee-eventos-drafts';
export function getDrafts() {
  try { return JSON.parse(sessionStorage.getItem(DRAFTS_KEY) || '[]'); }
  catch { return []; }
}
export function addDraft(draft) {
  const drafts = getDrafts();
  drafts.unshift(draft);
  sessionStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
}
/* Lista combinada: borradores de la demo primero, luego el set base.
   Adjunta assignedGestorId a cada evento (fuente única de verdad). */
export function allEvents() {
  const drafts = getDrafts();
  const deltas = getCargueDeltas();
  const overrides = getOverrides();
  const base = [...drafts, ...EVENTS];
  return base.map((ev) => {
    const d = deltas[ev.id];
    const ov = overrides[ev.id];
    /* Primero aplica override de edición, luego deltas de cargue. */
    const merged = ov ? { ...ev, ...ov } : ev;
    const withGestor = { ...merged, assignedGestorId: resolveGestorId(merged) };
    if (!d) return withGestor;
    return {
      ...withGestor,
      insc: { done: Math.min((merged.insc.done || 0) + (d.insc || 0), merged.insc.total || Infinity), total: merged.insc.total },
      res:  { done: Math.min((merged.res.done  || 0) + (d.res  || 0), merged.res.total  || Infinity), total: merged.res.total  },
      med:  { done: Math.min((merged.med.done  || 0) + (d.med  || 0), merged.med.total  || Infinity), total: merged.med.total  }
    };
  });
}

/* ═══════════════════════════════════════════════════════════════
   OVERRIDES STORE — Edición de eventos
   sessionStorage key: 'naowee-eventos-overrides'
   Shape: { [eventId]: { name?, start?, end?, place?, gestorId?, descripcion?, ... } }

   Funciones exportadas:
     getOverrides()         → lee el mapa completo
     updateEvent(id, patch) → guarda un override (evento base) o actualiza draft
   ═══════════════════════════════════════════════════════════════ */
const OVERRIDES_KEY = 'naowee-eventos-overrides';

export function getOverrides() {
  try { return JSON.parse(sessionStorage.getItem(OVERRIDES_KEY) || '{}'); }
  catch { return {}; }
}

/**
 * Persiste cambios sobre un evento.
 * - Si el id es un borrador (está en getDrafts), actualiza ese draft in-place.
 * - Si es un evento base (EVENTS), guarda un override en OVERRIDES_KEY.
 * @param {string} id - ID del evento
 * @param {Object} patch - Campos a actualizar (name, start, end, place, gestorId, descripcion…)
 */
export function updateEvent(id, patch) {
  const drafts = getDrafts();
  const draftIdx = drafts.findIndex((e) => e.id === id);
  if (draftIdx !== -1) {
    /* Borrador: actualizar el draft completo. */
    drafts[draftIdx] = { ...drafts[draftIdx], ...patch };
    sessionStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
  } else {
    /* Evento base: guardar override. */
    const overrides = getOverrides();
    overrides[id] = { ...(overrides[id] || {}), ...patch };
    sessionStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
  }
}

/* ═══════════════════════════════════════════════════════════════
   CARGUE STORE — Fase 4
   sessionStorage key: 'naowee-eventos-cargue-deltas'
   Shape: { [eventId]: { insc: number, res: number, med: number } }

   Funciones exportadas:
     getCargueDeltas()                → lee el mapa completo
     applyUpload(eventId, tipo, n)    → aplica +n al tipo (insc|res|med)
     getUploadHistory(eventId)        → lista de registros previos del evento
     addUploadRecord(eventId, record) → persiste un registro histórico (audit)
   ═══════════════════════════════════════════════════════════════ */
const DELTAS_KEY   = 'naowee-eventos-cargue-deltas';
const HISTORY_KEY  = 'naowee-eventos-cargue-history';

export function getCargueDeltas() {
  try { return JSON.parse(sessionStorage.getItem(DELTAS_KEY) || '{}'); }
  catch { return {}; }
}

/**
 * Aplica un cargue al store de deltas de un evento.
 * @param {string} eventId - ID del evento (ej. 'EV-2026-001')
 * @param {'insc'|'res'|'med'} tipo - tipo de cargue
 * @param {number} n - cantidad de filas válidas cargadas
 */
export function applyUpload(eventId, tipo, n) {
  const deltas = getCargueDeltas();
  if (!deltas[eventId]) deltas[eventId] = { insc: 0, res: 0, med: 0 };
  deltas[eventId][tipo] = (deltas[eventId][tipo] || 0) + n;
  sessionStorage.setItem(DELTAS_KEY, JSON.stringify(deltas));
}

/**
 * Recupera el historial de cargues de un evento (para audit trail en la UI).
 * @param {string} eventId
 * @returns {Array<{tipo, n, timestamp, modeLabel}>}
 */
export function getUploadHistory(eventId) {
  try {
    const all = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '{}');
    return all[eventId] || [];
  } catch { return []; }
}

/**
 * Persiste un registro de cargue para el historial del evento.
 * @param {string} eventId
 * @param {{ tipo: string, n: number, timestamp: string, modeLabel: string }} record
 */
export function addUploadRecord(eventId, record) {
  let all;
  try { all = JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '{}'); }
  catch { all = {}; }
  if (!all[eventId]) all[eventId] = [];
  all[eventId].unshift(record);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify(all));
}
