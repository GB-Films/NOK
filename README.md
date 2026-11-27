# NOK · Tu vida, en modo juego

**[Entrar al campamento](https://gb-films.github.io/NOK/)** desde una computadora o un celular. No requiere instalación.

- **Continuar con Google** crea o recupera la partida de esa cuenta. En una computadora compartida elegí **Ajustes → Mi cuenta y guardado → Guardar y cerrar sesión** antes de irte.
- **Explorar sin guardar** abre una partida temporal. No se sube a Firebase ni se guarda en el navegador; se pierde al recargar. Las partidas de ediciones anteriores no se importan automáticamente.
- Si dos dispositivos editan a la vez, la versión antigua no pisa a la nueva. Ante una falla de conexión, dejá abierta la pestaña y reintentá desde Ajustes.

## Cómo está separado el código de los datos

GitHub Pages distribuye el juego y sus ilustraciones, no las partidas. Se usa Firebase Authentication de GB Studio (Google verificado) y Firestore. El acceso a cada partida se limita en el servidor al identificador de su titular: no se puede listar, leer o escribir el mundo de otro jugador. La sesión y el estado local viven en memoria. La bóveda del juego conserva su clave maestra independiente. Este control de acceso no equivale a cifrado de extremo a extremo de toda la partida.

Las reglas de producción se mantienen en el [repositorio de GB Studio](https://github.com/GB-Films/GB-Studio/blob/main/firestore.rules), junto al resto de las reglas de la base compartida. **No publicar** la configuración de pruebas de este repositorio en producción.

## Desarrollo y publicación

Con Node 24: `npm ci`, `npm test` y `npm run build`. El resultado está en `dist/`. Cada cambio publicado en `main` recompila y despliega únicamente esa carpeta mediante el workflow de Pages.

Prueba de navegador (Chrome instalado): `node tests/browser.mjs` después de compilar. Pruebas de permisos con dos cuentas ficticias, Java 21 y la CLI de Firebase: `firebase emulators:exec --project demo-nok --only firestore --config tests/firebase.json "npm run test:rules"`. Para comprobar exactamente las reglas compartidas, indicar su archivo con `NOK_TEST_RULES`. Nunca requiere datos reales.
