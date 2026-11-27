# Rendimiento del campamento web

Revisión de la entrada `/NOK/`. La referencia es el juego de `main` en `c4d56b2`. La candidata se sirve con la misma ruta, **sin desplegarla**.

## Resultado del 27 de noviembre de 2026

Medianas de tres sesiones independientes por versión y perfil, con Chrome 158.0.8127.38. Para las reaperturas se toman los seis clics en caliente. [Resultados de las 12 sesiones locales y las dos visitas públicas](mediciones-web.json).

| Qué se midió | Escritorio antes → después | Móvil antes → después |
|---|---:|---:|
| Portada: descarga | 1822 → 304 kB | 1822 → 304 kB |
| Portada: recursos además del HTML | 29 → 8 | 29 → 8 |
| Portada: carga completa | 879 → 340 ms | 3182 → 1059 ms |
| Portada: mayor contenido visible (LCP) | 508 → 516 ms | 688 → 688 ms |
| Clic en Entrar → mundo activo | 220 → 177 ms | 919 → 720 ms |
| Mismo clic → mundo activo **y** fondo recibido | 220 → 266 ms | 919 → 1058 ms |
| Movimiento: tiempo ocupado del hilo principal | 159 → 104 ms | 860 → 461 ms |
| Movimiento: cálculo de posiciones (layout) | 10,7 → 0 ms | 68,6 → 0 ms |
| Movimiento: intervalo del cuadro en el percentil 95 | 18,2 → 18,2 ms | 18,1 → 18,1 ms |
| Primera apertura de Ajustes | 106 → 89 ms | 365 → 287 ms |
| Reabrir Ajustes | 32 → 33 ms | 36 → 34 ms |
| Clic en Audio dentro de Ajustes | 32 → 33 ms | 46 → 43 ms |
| Primera apertura del Tablón | 51 → 44 ms | 202 → 153 ms |
| Reabrir Tablón | 33 → 33 ms | 88 → 47 ms |

**Qué frenaba la experiencia:**

- **Portada:** 1615 de 1822 kB eran imágenes; dos mapas completos utilizados como miniaturas de Ajustes sumaban 895 kB antes de entrar. Ahora la portada pide 117 kB de arte y la decodificación medida en móvil baja de 84 a 17 ms. El JS de portada sigue en 74 kB: no era el mayor gasto. Las imágenes ocultas esperan a su vista; la portada usa arte a su tamaño y una sola hoja de estilos en el mismo orden que las nueve anteriores.
- **Entrada al mundo:** además de la descarga había trabajo de JS innecesario. Ya no se construyen las celdas de la pala mientras está cerrada ni se reconstruyen los obstáculos en cada consulta de rutas. La traza móvil de evaluación del script de entrada bajó de 467 a 132 ms. Se compacta el código del juego y se prioriza únicamente el fondo que corresponde a esa partida, hora y estación.
- **Movimiento:** personaje y mascotas conservan su anclaje, pero se desplazan sin recalcular el diseño del documento en cada paso. La cámara usa las dimensiones ya observadas y las mascotas no buscan sus elementos en el documento en cada cuadro. El tiempo ocupado baja; **no se observó una mejora del intervalo típico de cuadros**.
- **Paneles:** en Ajustes, la primera apertura gastaba tiempo en disposición de texto y búsqueda de fuentes para símbolos. Se sustituyeron esos símbolos por dibujos vectoriales locales. El layout móvil de esa apertura bajó de 238 a 158 ms. El Tablón genera la semana y las columnas móviles al mostrarlas, y evita dibujar de entrada todas las filas fuera de vista.

**Costos que quedan:** al no precargar mapas grandes en la portada, desde el clic el fondo completo llega 46 ms más tarde en escritorio y 139 ms más tarde en móvil. El personaje acepta input antes y la carga inicial se acorta, pero esa pequeña demora posterior es real. El LCP prácticamente no cambió. En escritorio, la mediana del peor intervalo de movimiento por recorrido pasó de 18 a 72 ms (aprox. un cuadro demorado por recorrido); en móvil se mantuvo en 18 ms. En una traza adicional de escritorio hubo un intervalo de 54 ms sin una tarea larga de JS en ese tramo. No se pudo atribuir el origen ni verificar cómo se percibe en un dispositivo físico.

**Control desde Pages:** en la URL pública se recorrieron portada → exploración → movimiento → Ajustes/Tablón. La carga remota fue de 1,24 s en escritorio y 3,50 s en móvil, una pasada por perfil; el botón de Google también abrió el dominio de cuentas de Google. La candidata no está en Pages. No se usó una cuenta real ni se escribieron partidas remotas; no se midió Safari/iOS ni un teléfono físico.

**Cabaña:** se retiraron el objeto `#world-house`, su cartel y su área de interacción, también en construcción. La prueba de navegador verifica la ausencia de solicitudes de su imagen y la conservación de coordenadas antiguas y de la ficha Perfil → Hogar. No hay migración de partidas ni cambios en el cliente nativo.

## Cómo se midió

- Chrome estable en Windows, un navegador por vez y una sesión nueva sin caché por pasada. Tres pasadas por combinación, alternando la referencia y la candidata. Servidor HTTP local idéntico con gzip para texto; los WebP se sirven sin recomprimir. También se recorrió la URL real de Pages como control independiente, no como pareja para comparar un servidor remoto con uno local.
- Escritorio: 1366 × 768, densidad 1, CPU sin limitar, 20 Mb/s y 30 ms. Móvil emulado: 390 × 844, densidad 2, pantalla táctil, CPU limitada 4×, 5 Mb/s y 100 ms. La subida en ambos perfiles fue de 2 Mb/s.
- Mismo mundo diurno de prueba, cuatro mascotas y 231 misiones. Se entra desde la portada mediante **Explorar sin guardar**, con datos temporales y semilla fija. No se mide la espera humana en Google ni una lectura privada de Firestore. Una prueba funcional aparte cubre el camino de una cuenta con partida ya configurada.
- **Portada:** navegación hasta el evento de carga y, por separado, hasta el mayor contenido pintado (LCP). Los kB son cuerpos comprimidos recibidos, en base decimal, sin cabeceras.
- **Entrada:** del clic a dos cuadros de animación tras activar el mundo. También se registra cuándo ya se cumplen ambas condiciones: mundo activado y archivo del fondo elegido recibido. No equivale a que se haya pintado hasta el último sprite.
- **Movimiento:** con el terreno y los ocho portales cargados, se sostiene derecha 820 ms e izquierda 820 ms; se comprueba el desplazamiento real. Se registra intervalo entre cuadros, tiempo dedicado al cálculo de posiciones y tiempo ocupado del hilo principal. Son tiempos durante el recorrido, no milisegundos por cuadro.
- **Interacciones:** clic a dos cuadros de animación (aproximación a la respuesta visible). Se mide la primera apertura de Ajustes y del Tablón, dos reaperturas de cada uno y un clic en la sección Audio. No son mediciones de INP de usuarios reales.

## Reproducir

Con Node 24, Chrome y las dependencias de este repositorio:

```sh
npm ci
npm run build
npm test
node tests/browser.mjs
node tests/performance.mjs dist desktop
node tests/performance.mjs dist mobile
```

Para la referencia, compilar `c4d56b2` **en otra carpeta** y pasar la ruta de su `dist` al mismo medidor de la rama. Para contrastar con Pages, reemplazar `dist` por `https://gb-films.github.io/NOK/`. El tercer argumento opcional indica las repeticiones. Cada ejecución emite JSON con tamaños, tiempos de eventos, cuadros y trazas de decodificación, JS, layout y pintura. Los tiempos de traza de distintos hilos pueden solaparse: no deben sumarse como si fueran tiempo de reloj.
