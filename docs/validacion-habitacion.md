# Comprobación de la segunda versión

Verificado el 9 de noviembre de 2026, sobre la copia local. Sin commit, push ni publicación.

- `npm run build`: correcto. Se generan la página clásica y `/room/`.
- `git diff --check`: correcto.
- La versión compilada sirve por HTTP las dos páginas, el PDF, su vista previa, el retrato y todos los archivos de `dist/assets`.
- El PDF publicado en `dist/cv.pdf` conserva el hash del original aportado.
- Navegador: seis experiencias accesibles con sus superficies CSS3D y recorridos de cámara.
- Biblioteca: selección de PC Control, apertura de la ficha dentro del monitor y acceso al repositorio.
- Libro mágico: recorrido de sus cuatro capítulos y botón Siguiente desactivado al llegar al último.
- Formación: extracción y selección de los libros de IA/Big Data y ASIR, con contenido propio.
- Mural: nota de carnets B/A2, coche propio y disponibilidad para viajar.
- Currículum: vista del documento original, enlaces de apertura y descarga.
- Teléfono: navegación entre inicio y aplicaciones, enlace de correo y copia de dirección con confirmación visible.
- Escape: retorno a la habitación y recuperación del foco.
- Vista móvil comprobada a 390 × 844; vista de escritorio a 1200 × 800 y 1280 × 900. Biblioteca ampliada y ficha de PC Control comprobadas en móvil.
- No se observaron errores de consola durante la verificación.

El rendimiento en otros dispositivos no se ha medido. Si la escena no está disponible, el código ofrece una vista de lectura. Las portadas son ilustraciones, y los gráficos del monitor secundario no son lecturas reales del visitante.

## Ajuste de transiciones y botón de regreso

- Recorridos Bézier con retroceso al salir del objeto, curva de aproximación, variación de campo de visión y una inclinación leve durante el cambio entre apartados. El encuadre y la inclinación se estabilizan al llegar. Se conserva el modo de movimiento reducido.
- Botón de volver ampliado: 48 px de altura en escritorio y 46 px en móvil; etiqueta ESC visible en ambos.
- Navegación comprobada del ordenador a Minecraft y de Minecraft a la estantería; llegada a las superficies interactuables sin errores de consola.
- En móvil a 390 px, el botón mide aproximadamente 195 × 46 px y mantiene visible ESC. Se comprobó el regreso con clic.
- Compilación y `git diff --check` correctos.

## Recorridos continuos y navegación interior

Se corrigió el flujo de entrada y salida para mantener el área de renderizado sin cambios de tamaño. El contenido permanece montado en sus objetos, y el estado de salida conserva la escena hasta finalizar el retroceso de cámara. El avance usa tiempo entre fotogramas limitado para evitar que una pausa de renderizado salte directamente al final.

- Rectángulo del escenario en vista general y primer plano: x=0, y=156, ancho=805, alto=550 en la ventana comprobada. No cambia al entrar ni salir.
- Grabación real del navegador: 116 fotogramas distintos en la entrada al ordenador y 115 en la salida hacia la vista superior. Se entrega un GIF reducido y muestreado de esa captura, sin interpolar posiciones de cámara.
- Se recorrieron los seis apartados desde una carga limpia: ordenador, Minecraft, estantería, mural, CV y teléfono. Sin errores de consola en esa carga.
- Biblioteca: cambio animado a PC Control, apertura de su ficha y botón Siguiente hacia DHCP/DNS dinámico.
- Estantería: el contenido de IA permanece inicialmente mientras se devuelve ese libro; el contenido de ASIR se cambia a mitad del recorrido, con la superficie oculta, y se muestra al abrir el nuevo libro. Se comprobó el paso animado a la segunda página.
- Salida por Escape comprobada en móvil: termina en el estado overview.
- La opción de movimiento completo está activada por defecto por petición expresa del usuario; puede cambiarse desde el botón de animaciones de cámara de la vista general.
- Se reduce el coste del renderizado con una resolución de sombras de 1024 y un límite de densidad de píxeles de 1,25 en escritorio y 1 en móvil. No se afirma una tasa de fotogramas garantizada en otros equipos.

## Fichas completas, libros rápidos y estética de Minecraft

- Las cinco fichas del monitor se comprobaron con una altura de contenido de 473 px y `scrollHeight` de 473 px. Su columna de texto mide 390 px, sin contenido desbordado. Todos los enlaces de repositorio aparecen debajo de su portada y todas las imágenes cargaron.
- Se sustituyeron las portadas abstractas por la composición Windows/Ansible, las marcas de MeT y PC Control y los esquemas de DNS y BitLocker. Fuentes en `activos-visuales.md`.
- Se corrigió un desplazamiento interno de la capa CSS3D provocado por el enfoque del navegador; se utiliza `overflow: clip` para mantener la interfaz alineada con el monitor.
- Intercambio de libros configurado a 0,7 s. Una comprobación desde el clic hasta la disponibilidad del libro registró 798 ms, incluyendo la interacción de la herramienta.
- Los cinco libros contienen una única apertura; no existe el botón de pasar página de formación. Las dos páginas de cada libro se comprobaron a 748 px de alto, sin desbordamiento.
- Certificaciones incluye permisos B y A2; Experiencia destaca Input for You. Los relatos usan un tono cercano y abreviaturas como IA, ASIR, VMs y docs.
- El libro de MeT conserva el texto de los dos primeros apartados y termina en el tercero, «¿Quieres verlo?», con enlaces al repositorio y a la app Vue. Sus tres aperturas se comprobaron sin desbordamiento (623 px por página).
- Mesa con bloque de obsidiana, superficie roja, esquinas turquesa y ocho pequeños glifos grises animados en la vista general. Tipografía Monocraft en el libro de MeT.

### Nitidez y accesos — 10 de noviembre de 2026
- Se elimina el límite previo de densidad (1 en móvil / 1,25 en escritorio): la escena respeta la densidad de pantalla hasta 2.
- Durante el recorrido se mantienen las superficies CSS3D. Al detenerse la cámara, la misma superficie pasa a una capa plana con zoom de maquetación y posición calculada a partir del objeto. Así el navegador dibuja el texto a su tamaño final, sin ampliar una textura 3D almacenada. Al salir vuelve al objeto para conservar la animación inversa y el estado de los contenidos.
- Comprobadas las seis superficies en navegador: capa plana activa, transformaciones de perspectiva eliminadas y sin errores de consola. Comprobados cambios de apartado, cambio de libro y regreso a la habitación con movimiento completo.
- Menú de escritorio: texto de 14 px, iconos de 25 px y botones de 64 px de alto. En móvil: texto de 11 px y botones de 54 px durante la exploración; comprobado a 390 px sin desbordamiento horizontal.
- Comprobada ficha sin desbordamiento interno (473 px visibles y 473 px de contenido) a 1806 × 884, y ajuste vertical sin desplazamiento de página en escritorio.

### Encuadre general ampliado — 10 de noviembre de 2026
- Cámara general un 16 % más cerca en escritorios de 1100 px o más (aumento aparente aproximado del 19 %), con desplazamiento vertical suave para ocupar mejor el escenario. En pantallas intermedias se acerca un 8 %; en móvil se conserva la distancia para mantener la habitación completa.
- El encuadre se recalcula al cambiar de tamaño y al volver a la vista general. Los acercamientos a los objetos y sus superficies de lectura conservan su encuadre.
- Ajustada la introducción en escritorios de poca altura para que no invada los accesos inferiores.
- Comprobados entrada al monitor y regreso con animación completa, y compilación de producción sin errores.

### Acceso integrado bajo el nombre — 10 de noviembre de 2026
- La tarjeta de entrada es el elemento inmediatamente posterior al h1 de la portada y existe una sola vez.
- Imagen real cargada y encuadrada; la imagen y el botón abren `/room/`. Comprobados ambos accesos en navegador, sin errores de consola.
- Comprobado a 1200 px y 390 px: en móvil pasa a una columna, con imagen y botón dentro de la tarjeta, sin desbordamiento horizontal.
- Compilación de producción completada y comprobación de espacios de Git sin errores.
