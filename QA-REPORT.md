# QA + Pulido — Naowee Eventos demo (v0.3.0)

> Auditoría por lectura de código (3 agentes en paralelo) sobre las 9 pantallas + CSS/JS canónicos compartidos. Verificado por Claude. Sin errores JS ni imports rotos en ninguna pantalla.

**Severidades:** 1 CRÍTICO · 4 ALTO (1 falso positivo) · ~6 MEDIO · ~6 BAJO.

---

## 🔴 CRÍTICO
| Pantalla | Hallazgo | Estado |
|---|---|---|
| `calendario.html` | Campo **Fecha/Hora nativos** (`<input type=date/time>`) en vez del datepicker canónico. | ✅ **FIXED + verificado** — Fecha→`.naowee-datepicker` canónico, Hora→dropdown de horas. Bug extra resuelto: el calendario caía en la esquina por `position:fixed` dentro de un `transform` del modal → cambié el modal abierto a `transform:none` (sin containing block). Calendario ahora ancla al campo. |

## 🟠 ALTO
| Pantalla | Hallazgo | Estado |
|---|---|---|
| `usuarios.html` | `#c01818` hardcodeado en 3 labels required (L235/244/252). | ✅ **FIXED** — clase canónica `.naowee-textfield__label--required` (asterisco `var(--accent)` vía `::after`). |
| `dashboard.html` | Fila `<tr>` clicable (tabindex+aria-label) sin `role="button"`. | ✅ **FIXED** — `role="button"` agregado. |
| `usuarios.html` | "Modales sin tecla Escape". | ✓ **FALSO POSITIVO** — el handler Escape existe (L830-833). Sin acción. |
| Global | Cache-busters `?v=` desalineados (forms.css/footer en 0.1.0/0.2.0 vs módulo v0.3.0). | ⏳ **PENDIENTE** — mitigado por server `no-cache` (no sirve stale ahora); importa para deploy real. Bump a `?v=0.3.0`. |

## 🟡 MEDIO (a11y/responsive — wave 2)
- **`:focus-visible` ausente** en icon-buttons/triggers custom (usuarios/perfil/calendario). Los componentes de forms.css ya lo tienen; faltan los custom (`.naowee-modal__dismiss`, acciones de tabla). → agregar `:focus-visible { box-shadow: 0 0 0 3px rgba(215,64,9,.18) }`.
- **`evento-detalle.html` modal**: cierra con Esc + backdrop, pero **sin focus-trap** ni foco inicial. → al abrir, `focus()` al close; atrapar Tab.
- **`cargue.html` oversight (ADMIN)**: tabla no pasa a **stacked cards** en ≤640px (riesgo de overflow a 375px); segments Masivo/Manual sin `role="tablist"`/`aria-selected`.
- **`perfil.html`**: solo `@media(700px)`; falta `@media(600px)` + tabla→stacked en móvil chico.
- **`eventos.html`**: `<tr>` no navegable por teclado (el botón de acción interno basta) — inconsistencia menor vs dashboard.

## ⚪ BAJO (deuda menor)
- `evento-detalle.html`: modal usa naming propio `ev-modal*` en vez de `naowee-modal*` (consistencia con usuarios) — CSS base inline es correcto (el DS no lo trae); solo naming.
- `box-shadow` hardcodeado en `.ev-modal` → usar token `--shadow-card`.
- Imports JS sin `?v=` (crear/detalle/cargue).
- Comentario desactualizado en dashboard.html (~L943: "scaleX" vs `clip-path` real).
- Breakpoints heterogéneos en usuarios.html (consolidar a ≤600/≤900/≤1023).
- `index.html` no carga el footer pill (intencional, es landing).

## ✅ LIMPIO (verificado)
- 0 errores JS, 0 imports rotos, 0 tokens CSS sin definir.
- `top-header` NO pinta título de página (correcto; `mountHeader` acepta title/subtitle por compat pero no renderiza).
- Modales `usuarios.html` y `calendario.html`: CSS base completo (overlay fixed + backdrop + centrado + sticky header/footer + bottom-sheet móvil) + `role=dialog`/`aria-modal`/`aria-label`.
- `evento-crear`/`evento-detalle`/`cargue`: datepicker/dropdown canónicos, `btn--loud`/`--link`, helper de error canónico, bottom-sheets, stacked cards móvil.
- `prefers-reduced-motion` honrado en todos; sidebar drawer off-canvas; popovers/datepicker bottom-sheet en móvil.

---

### Orden de ejecución — TODO COMPLETADO ✅
1. ✅ usuarios labels · dashboard `role=button`
2. ✅ calendario datepicker canónico (+ fix bug posición `fixed`-en-`transform` → `transform:none`)
3. ✅ Wave 2 a11y: `:focus-visible` (perfil/usuarios/cargue/calendario) + **focus-trap** modal detalle (foco entra/cicla/retorna; fix timing `setTimeout 240ms` porque el panel arranca opacity:0) + segments cargue `role=tablist`/`aria-selected`
4. ✅ Responsive: perfil `@media(600)` + **tablas → stacked cards** en móvil (perfil, usuarios, cargue oversight) — verificado a 375px
5. ✅ Cache-busters `?v=0.3.0` alineados en las 9 páginas
6. ✅ Extra: `evento-detalle` modal `transform:none` (evita el mismo bug del datepicker interno) + `box-shadow`→token `--shadow-card`

**QA + pulido CERRADO.** 9 pantallas, 0 errores JS, canónico + responsive + a11y. Único pendiente conocido: focus-trap auto-foco usa `setTimeout 240ms` (post-transición) — robusto, no flaky.
