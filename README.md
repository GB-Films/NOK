# NOK · Tu vida, en modo juego

**[Entrar al campamento](https://gb-films.github.io/NOK/)** desde una computadora o un celular. No requiere instalación.

- **Continuar con Google** abre tu campamento y recuerda tu sesión en ese navegador. Cuando volvés, incluso después de cerrarlo, se abre tu mundo sin pedirte Google otra vez. Si todavía no configuraste el personaje, te lleva al paso que te falta. En una compu compartida elegí **Ajustes → Mi cuenta y guardado → Guardar y cerrar sesión** antes de irte. Otro navegador, el modo incógnito, borrar los datos del sitio o una sesión vencida pueden requerir que vuelvas a identificarte.
- **Explorar sin guardar** abre una partida temporal. No se sube a Firebase ni se guarda en el navegador; se pierde al recargar. Las partidas de ediciones anteriores no se importan automáticamente.
- Si dos dispositivos editan a la vez, la versión antigua no pisa a la nueva. Ante una falla de conexión, dejá abierta la pestaña y reintentá desde Ajustes.

## Asistente del campamento

Desde el mapa, tocá **✦ Asistente**, al lado de Ajustes. Escribí un pedido o tocá **Dictar** si el navegador lo permite. El dictado solo transcribe: revisá el texto, tocá **Preparar** y confirmá la propuesta. Podés corregirla o descartarla sin guardar nada.

- **«Agendá dentista mañana a las cinco de la tarde».** Se guarda en la Agenda de NOK, no en Google Calendar. Si falta la fecha o la hora, podés responder en el mismo cuadro o completar los campos.
- **«Ordená la mochila por nombre»** u **«Ordená las tareas de hoy por fecha».** Elegí la sección y marcá las tareas que querés ordenar. Las de prioridad alta siguen primero, las pendientes sin fecha van al final al ordenar por fecha, y las que no elegiste conservan su lugar.
- **«Creá una tarea: comprar materiales»**, **«Pasá comprar materiales a hoy»** o **«Dale prioridad alta a comprar materiales»**. La propuesta te muestra los títulos y proyectos para que elijas las tareas correctas.

Los pedidos escritos se interpretan en el dispositivo. Para frases menos directas se intenta usar la [IA integrada del navegador](https://developer.chrome.com/docs/ai/prompt-api) **solo si ya está instalada y admite español**. Sin modelo, los pedidos habituales y la revisión siguen funcionando. No requiere claves, no descarga un modelo ni envía tu partida a una IA. Si usás el micrófono, el navegador puede procesar el audio con su propio servicio de voz. NOK no guarda el audio ni la conversación. El asistente no lee la bóveda ni opera sobre Finanzas.

## Mi día y mis roles

Al entrar a un mundo configurado en escritorio, **Mi día** queda a la izquierda del mapa y también del Tablón. Los eventos y cumpleaños aparecen primero. Arrastrá una misión del Tablón o de **Sin horario** hasta una hora. Para asignar minutos exactos, cambiar de día o elegir un rol, tocá la tarea. Con **+ Tarea** también podés programar una misión existente o crear una nueva. Son las mismas misiones del Tablón, no copias. En teléfonos y pantallas estrechas, abrí **Mi día** desde el mapa: solo se muestran los horarios ocupados.

**Semana y roles** permite recorrer semanas y abrir cualquier día. Cada rol (por ejemplo, Dirección o Producción) tiene responsabilidades que se repiten en un día de la semana, además de las misiones puntuales que le asignes. Las casillas semanales tienen historial independiente; no se duplican tareas ni se asignan a otras personas. Las rutinas que ya tenías en el Tablón también aparecen en el día correspondiente.

**Vincular Google Calendar** es opcional y exclusivo de cuentas identificadas. Solicita acceso a los eventos de la cuenta con la que entraste a NOK; solo lee el calendario principal del día elegido. Al conectarlo, se actualiza automáticamente al cambiar la fecha o mientras la agenda está abierta. No sube misiones ni modifica eventos de Google. Los títulos recibidos y el permiso temporal viven en memoria: al recargar o al vencer el permiso hay que reconectar Calendar, no volver a crear el mundo ni cerrar sesión en NOK. **Desconectar** descarta el acceso de la visita; el permiso de Google se puede revocar desde tu cuenta de Google.

Para activar la integración en producción, el proyecto OAuth de la cuenta web debe tener habilitada Google Calendar API y el permiso `calendar.events.readonly` en su pantalla de consentimiento (con los usuarios de prueba o la verificación que Google requiera). No se necesita una clave privada en Pages. Referencias: [acceso con Google desde Firebase](https://firebase.google.com/docs/auth/web/google-signin) y [lectura de eventos de Calendar](https://developers.google.com/workspace/calendar/api/v3/reference/events/list).

## Cómo está separado el código de los datos

GitHub Pages distribuye el juego y sus ilustraciones, no las partidas. Se usa Firebase Authentication de GB Studio (Google verificado) y Firestore. El acceso a cada partida se limita en el servidor al identificador de su titular: no se puede listar, leer o escribir el mundo de otro jugador. Firebase conserva la sesión en este navegador si admite almacenamiento; NOK no guarda una copia local de la partida. Cada visita carga el mundo desde la cuenta y lo mantiene en memoria. Si la lectura falla, podés reintentar sin salir de la cuenta. La bóveda conserva su clave maestra independiente. Este control de acceso no equivale a cifrado de extremo a extremo de toda la partida.

Las reglas de producción se mantienen en el [repositorio de GB Studio](https://github.com/GB-Films/GB-Studio/blob/main/firestore.rules), junto al resto de las reglas de la base compartida. **No publicar** la configuración de pruebas de este repositorio en producción.

## Desarrollo y publicación

Con Node 24: `npm ci`, `npm test` y `npm run build`. El resultado está en `dist/`. Cada cambio publicado en `main` recompila y despliega únicamente esa carpeta mediante el workflow de Pages.

Prueba de navegador (Chrome instalado): `node tests/browser.mjs` después de compilar. Pruebas de permisos con dos cuentas ficticias, Java 21 y la CLI de Firebase: `firebase emulators:exec --project demo-nok --only firestore --config tests/firebase.json "npm run test:rules"`. Para comprobar exactamente las reglas compartidas, indicar su archivo con `NOK_TEST_RULES`. Nunca requiere datos reales.

Para verificar que Chrome recuerda la sesión al cerrar y reabrir el navegador, y la olvida al cerrar sesión: `firebase emulators:exec --project demo-nok --only auth --config tests/firebase.json "node tests/browser.mjs"`. Esta prueba usa el emulador local de Auth y un perfil de navegador descartable.
