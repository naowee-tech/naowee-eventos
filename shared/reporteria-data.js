/* ═══════════════════════════════════════════════════════════════════════
   REPORTERÍA — sintetizador de analítica POR EVENTO (determinista)
   ───────────────────────────────────────────────────────────────────────
   Diego (analítica) definió la arquitectura: 3 tableros por evento
   (Inscripciones · Resultados · Medallería). Aquí derivamos breakdowns
   coherentes a partir de los totales REALES de cada evento (insc/res/med
   {done,total} en events-data.js), sembrados por el id del evento → cada
   evento muestra números distintos pero estables, y los breakdowns SUMAN
   exactamente al total real. Eventos en borrador (done=0) → hasData=false
   y el tablero muestra empty states canónicos.
   ═══════════════════════════════════════════════════════════════════════ */
import { pct } from './events-data.js';

/* ── RNG determinista (FNV-1a → LCG) ─────────────────────────────────── */
function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

/* ── Catálogo de dimensiones (organismos = ligas) ────────────────────── */
export const ORGANISMOS = [
  { name: 'Liga Antioqueña',    av: 'AN', c: '#d74009' },
  { name: 'Liga del Valle',     av: 'VA', c: '#1f78d1' },
  { name: 'Liga Bogotana',      av: 'BO', c: '#7c3aed' },
  { name: 'Liga de Santander',  av: 'SA', c: '#1f8923' },
  { name: 'Liga Atlántico',     av: 'AT', c: '#0891b2' },
  { name: 'Liga Bolívar',       av: 'BL', c: '#9333ea' },
  { name: 'Liga Nariño',        av: 'NA', c: '#c2410c' },
  { name: 'Liga Meta',          av: 'ME', c: '#065f46' },
  { name: 'Liga Boyacá',        av: 'BY', c: '#1e40af' },
  { name: 'Liga Córdoba',       av: 'CO', c: '#92400e' },
  { name: 'Liga Caldas',        av: 'CA', c: '#b45309' },
  { name: 'Liga Tolima',        av: 'TO', c: '#0d9488' }
];

const DISCIPLINAS_MULTI = ['Atletismo', 'Natación', 'Ciclismo', 'Patinaje', 'Taekwondo', 'Judo', 'Karate Do', 'Baloncesto', 'Fútbol Sala', 'Voleibol', 'Levantamiento', 'Boxeo', 'Tenis de Mesa', 'Gimnasia'];
const NOMBRES = ['Carlos Rodríguez', 'Luis Martínez', 'Sebastián Torres', 'Felipe Gutiérrez', 'Andrés Vargas', 'Daniel Morales', 'Camilo Herrera', 'Ricardo Sánchez', 'Mateo Jiménez', 'Santiago Ramírez', 'Valentina Ríos', 'Laura Castro', 'Mariana Díaz', 'Sofía Mejía'];

/* Pruebas representativas por deporte (para single-sport y mejor marca). */
const PRUEBAS_POR_DEPORTE = {
  'Atletismo': ['100m Planos', '200m Planos', '400m Planos', '1.500m', 'Salto Largo', 'Maratón'],
  'Natación':  ['50m Libre', '100m Libre', '200m Libre', '100m Espalda', '100m Pecho'],
  'Ciclismo':  ['Ruta 120 km', 'Contrarreloj', 'Montaña 40 km'],
  'Taekwondo': ['Kyorugi -54kg', 'Kyorugi -58kg', 'Poomsae'],
  'Voleibol':  ['Masculino', 'Femenino'],
  'Fútbol Sala': ['Masculino', 'Femenino'],
  'Levantamiento': ['Arranque -73kg', 'Envión -81kg', 'Total Olímpico'],
  'Boxeo':     ['-52kg', '-60kg', '-69kg'],
  'Tenis de Mesa': ['Individual M', 'Individual F', 'Dobles'],
  'Gimnasia':  ['All Around', 'Suelo', 'Barra de equilibrio']
};
/* Generadores de "marca" por familia de deporte (sembrado). */
function marcaFor(sport, rnd) {
  const s = sport.toLowerCase();
  if (s.includes('atlet')) return (10 + rnd() * 1.2).toFixed(2) + ' s';
  if (s.includes('nataci')) return (22 + rnd() * 3).toFixed(2) + ' s';
  if (s.includes('ciclis')) return '3h ' + (10 + Math.floor(rnd() * 40)) + 'm';
  if (s.includes('levant') || s.includes('pesas')) return (180 + Math.floor(rnd() * 60)) + ' kg';
  if (s.includes('boxeo') || s.includes('taekwon') || s.includes('judo') || s.includes('karate')) return (8 + Math.floor(rnd() * 8)) + ' pts';
  return (80 + Math.floor(rnd() * 20)) + ' pts';
}

/* ── Reparto entero determinista según pesos (suma exacta al total) ──── */
function splitTotal(total, weights) {
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const out = weights.map((w) => Math.round((total * w) / sum));
  const drift = total - out.reduce((a, b) => a + b, 0);
  if (out.length) out[0] += drift;             // corrige redondeo en el mayor
  return out.map((v) => Math.max(0, v));
}
/* Pesos decrecientes con jitter sembrado (para rankings realistas). */
function decayWeights(n, rnd) {
  return Array.from({ length: n }, (_, i) => (n - i) + rnd() * 1.6);
}

const num = (n) => (n || 0).toLocaleString('es-CO');

/* ═══════════════════════════════════════════════════════════════════════
   buildReporteria(ev) — objeto consumido por reporteria.html
   ═══════════════════════════════════════════════════════════════════════ */
export function buildReporteria(ev) {
  const rnd = makeRng(seedFrom(ev.id));
  const insc = ev.insc || { done: 0, total: 0 };
  const res = ev.res || { done: 0, total: 0 };
  const med = ev.med || { done: 0, total: 0 };

  /* Deportes del evento: multideporte → disciplinas; single → 1 deporte. */
  const isMulti = /multideporte/i.test(ev.sport || '');
  const baseSport = (ev.sport || 'Deporte').split('·')[0].trim();
  const disciplinas = isMulti
    ? DISCIPLINAS_MULTI.slice(0, Math.max(6, parseInt((ev.sport.match(/(\d+)/) || [])[1] || '14', 10)))
    : [baseSport];

  /* Nº de organismos participantes (sembrado, acotado al catálogo). */
  const orgCount = insc.done > 0 ? Math.min(ORGANISMOS.length, Math.max(3, 4 + Math.floor(rnd() * 8))) : 0;
  const orgs = ORGANISMOS.slice(0, orgCount);

  /* ── INSCRIPCIONES ─────────────────────────────────────────────────── */
  const pruebasTotal = isMulti ? disciplinas.length * 6 : (PRUEBAS_POR_DEPORTE[baseSport] || ['Final']).length * 2;
  const inscData = {
    hasData: insc.done > 0,
    inscritos: insc.done,
    cupo: insc.total,
    pctCupo: pct(insc.done, insc.total),
    organismosCount: orgCount,
    deportesCount: disciplinas.length,
    pruebasCount: pruebasTotal,
    pruebasConInscritos: Math.round(pruebasTotal * (0.55 + rnd() * 0.35)),
    daily: dailyCurve(insc.done, rnd),
    porOrganismo: orgs.map((o, i) => ({ ...o })),
    porDeporte: [],
    tipo: []
  };
  // reparto inscritos por organismo
  splitTotal(insc.done, decayWeights(orgCount, rnd)).forEach((v, i) => { if (inscData.porOrganismo[i]) inscData.porOrganismo[i].v = v; });
  inscData.porOrganismo.sort((a, b) => b.v - a.v);
  // por deporte (multi) o por prueba (single)
  const depLabels = isMulti ? disciplinas : (PRUEBAS_POR_DEPORTE[baseSport] || ['Final']);
  inscData.porDeporteLabel = isMulti ? 'Por deporte' : 'Por prueba';
  inscData.porDeporte = depLabels.map((l) => ({ lbl: l })).slice(0, 8);
  splitTotal(insc.done, decayWeights(inscData.porDeporte.length, rnd)).forEach((v, i) => { if (inscData.porDeporte[i]) inscData.porDeporte[i].v = v; });
  inscData.porDeporte.sort((a, b) => b.v - a.v);
  // tipo (Individual/Conjunto/Paradeporte)
  const tw = isMulti ? [0.55, 0.33, 0.12] : [/sala|voleibol|balonc/i.test(baseSport) ? 0.1 : 0.8, /sala|voleibol|balonc/i.test(baseSport) ? 0.85 : 0.12, 0.08];
  const tvals = splitTotal(insc.done, tw);
  inscData.tipo = [
    { lbl: 'Individual', val: tvals[0], c: '#1f78d1' },
    { lbl: 'Conjunto', val: tvals[1], c: '#d74009' },
    { lbl: 'Paradeporte', val: tvals[2], c: '#7c3aed' }
  ].filter((t) => t.val > 0);

  /* ── RESULTADOS ────────────────────────────────────────────────────── */
  const prueba = (PRUEBAS_POR_DEPORTE[isMulti ? 'Atletismo' : baseSport] || ['Final'])[0];
  const depShown = isMulti ? 'Atletismo' : baseSport;
  const tabla = [];
  if (res.done > 0) {
    const n = Math.min(8, NOMBRES.length);
    for (let i = 0; i < n; i++) {
      const nm = NOMBRES[(i + Math.floor(rnd() * 3)) % NOMBRES.length];
      tabla.push({
        pos: i + 1,
        dep: nm,
        org: orgs[i % Math.max(1, orgs.length)]?.name || 'Liga Nacional',
        av: nm.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase(),
        marca: marcaFor(depShown, rnd)
      });
    }
  }
  const resData = {
    hasData: res.done > 0,
    cargados: res.done,
    total: res.total,
    pctCargado: pct(res.done, res.total),
    deportistasConRes: res.done,
    mejorMarca: tabla.length ? tabla[0].marca : '—',
    deporteCtx: depShown,
    pruebaLbl: prueba,
    podio: tabla.slice(0, 3),
    tabla
  };

  /* ── MEDALLERÍA ────────────────────────────────────────────────────── */
  const totMed = med.done;
  // oro≈plata≈bronce (cada prueba reparte 3); split casi parejo
  const [oro, plata, bronce] = splitTotal(totMed, [0.34, 0.34, 0.32]);
  const medOrgs = orgs.map((o) => ({ ...o }));
  const oroSplit = splitTotal(oro, decayWeights(medOrgs.length, rnd));
  const plataSplit = splitTotal(plata, decayWeights(medOrgs.length, rnd));
  const bronceSplit = splitTotal(bronce, decayWeights(medOrgs.length, rnd));
  medOrgs.forEach((o, i) => { o.oro = oroSplit[i] || 0; o.plata = plataSplit[i] || 0; o.bronce = bronceSplit[i] || 0; });
  medOrgs.sort((a, b) => (b.oro - a.oro) || (b.plata - a.plata) || (b.bronce - a.bronce));
  const medData = {
    hasData: totMed > 0,
    oro, plata, bronce, total: totMed,
    pruebas: med.total,
    porOrganismo: medOrgs.filter((o) => o.oro + o.plata + o.bronce > 0)
  };

  return { ev, insc: inscData, res: resData, med: medData, num };
}

/* Curva diaria sembrada (campana sesgada) que suma exactamente al total. */
function dailyCurve(total, rnd) {
  const DAYS = 30;
  if (total <= 0) return Array.from({ length: DAYS }, (_, i) => ({ i, d: 0, a: 0 }));
  const weights = Array.from({ length: DAYS }, (_, i) => {
    const x = (i - DAYS * 0.55) / (DAYS * 0.28);
    return Math.exp(-x * x) * (0.7 + rnd() * 0.6);
  });
  const daily = splitTotal(total, weights);
  let acc = 0;
  return daily.map((d, i) => { acc += d; return { i, d, a: acc }; });
}
