# Correo de entrega — Módulo de Eventos (SUID / Ministerio del Deporte)

**Asunto:** Entrega del Módulo de Eventos — SUID / Ministerio del Deporte (versión demo funcional)

---

Estimada Danna, estimado equipo del Ministerio del Deporte:

Por medio del presente hacemos entrega formal del **Módulo de Eventos** del Sistema
Único de Información del Deporte (SUID), en su versión de demostración funcional. El
módulo fue construido siguiendo el alcance acordado en la fase de *discovery* y cubre,
de extremo a extremo, el flujo operativo de gestión de eventos deportivos por cargue.

A continuación detallamos las capacidades entregadas:

**1. Creación de eventos (versión ligera).**
Formulario de creación con los datos esenciales del evento (nombre, fechas de inicio y
fin, departamento y municipio en cascada, gestor responsable y descripción). El evento
queda en estado **Borrador** y transiciona automáticamente a **Activo** en su fecha de
inicio, y a **Finalizado** al concluir. Se incorporó la **edición del evento** con reglas
de negocio por estado: en borrador todo es editable; una vez **activo** se bloquean la
fecha de inicio y el lugar (la operación ya está en curso), manteniendo editables el
nombre, la fecha de fin, el gestor y la descripción; finalizado queda en solo lectura.

**2. Gestión de usuarios y gestión del evento.**
Administración de los usuarios de la plataforma (alta, edición, estados y roles) y
gestión integral de cada evento desde su detalle, incluyendo el seguimiento de avance
de inscripciones, ranking/resultados y medallería.

**3. Asignación de roles.**
El módulo opera con cuatro perfiles: **Administrador de eventos**, **Gestor de eventos**,
**Usuario del módulo** (lectura) y **Organismo** (calendario). Al crear o editar un
evento, el administrador asigna un gestor desde cualquier perfil de la plataforma —
mostrando el rol que cada persona tiene actualmente — e **invita** como gestor del
evento incluso a quien aún no lo es.

**4. Creación de eventos en el calendario interno.**
Vista de calendario mensual (estilo Google Calendar) integrada al módulo, donde los
eventos se visualizan por fecha, con detalle por día y acceso directo a la ficha del
evento. Disponible para los perfiles de lectura y operación.

**5. Creación de eventos con enlace externo para la Landing pública.**
Los organismos, ligas y entidades crean eventos de calendario con título, fecha y
**enlace externo (opcional)**, listos para reflejarse en el calendario de la Landing
pública. Estos eventos se integran también en el calendario interno del módulo.

**6. Perfil del deportista.**
Ficha del deportista con **insignias de reconocimiento** por nivel deportivo (olímpico,
profesional/federación, liga, juvenil, amateur) y **trazabilidad histórica completa**:
inscripciones, resultados/registros y medallería, organizada en pestañas y filtrable.

**7. Dashboard y reportería.**
Tablero analítico con los indicadores clave del módulo y la base de reportería para el
seguimiento de la operación de eventos, inscripciones, resultados y medallería.

---

Todo el sistema fue construido sobre el *design system* institucional de Naowee, con
una experiencia responsiva (escritorio y móvil) y consistente con la identidad del
SUID y el Ministerio del Deporte.

Quedamos atentos a sus comentarios para incorporar los ajustes finales y coordinar la
sesión de revisión correspondiente. Agradecemos la confianza depositada en el equipo.

Cordialmente,

**Doug Vargas**
Diseño y experiencia de producto — Naowee
[correo · teléfono]
