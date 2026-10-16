# Recorrido guiado de Vaulty

El primer acceso al Inicio abre un recorrido de siete pasos sobre la interfaz real: resumen, cuentas, registro, historial, presupuestos, planificación y privacidad. El registro y el inicio de sesión llevan a esta pantalla.

Se puede avanzar, volver, omitir o cerrar con Escape. **Mi perfil → Ver recorrido guiado** permite repetirlo desde cualquier sección y vuelve al Inicio. El recorrido no crea movimientos ni datos de ejemplo. Al interactuar con la aplicación fuera de la explicación, el recorrido se cierra para dejar trabajar al usuario.

En escritorio, la explicación se ubica junto al elemento destacado. En móvil, se coloca abajo y el contenido se desplaza para mantener visible la parte relevante. Se usan los colores y componentes existentes, sin incorporar una biblioteca de tours. Base UI administra el diálogo no modal, el foco y Escape.

## Persistencia

`User.productTourSeenAt` guarda cuándo se mostró por primera vez. Se registra al abrirlo, por lo que omitirlo, cerrar la pestaña o recargar no vuelve a dispararlo. También se respeta en otros dispositivos. Los usuarios anteriores al lanzamiento lo verán una vez en su próxima visita al Inicio.

La acción del servidor toma el usuario de la sesión, no acepta un identificador del cliente y solo actualiza fechas nulas. Repetir el recorrido no modifica la primera fecha. Si falla la conexión, un recibo local por usuario evita repetirlo en ese navegador; la sincronización se reintenta en la siguiente visita al espacio. Si fallan tanto la conexión como el almacenamiento del navegador, el respaldo solo dura la sesión actual de la página.

La migración `20261016090000_add_product_tour` agrega únicamente una columna opcional. Antes de desplegar el código sobre otra base existente, ejecutar `npx prisma migrate deploy` y generar el cliente con `npx prisma generate`. La migración se aplicó a la base configurada durante esta implementación. No modifica movimientos ni presupuestos. La revisión pendiente de la cadena histórica para crear una base desde cero se mantiene documentada en `acceso-y-gestion.md`.

## Verificación

- `npm test`: permisos de la acción, idempotencia, errores, aislamiento por usuario y límites de posicionamiento.
- `npm run test:ui`: apertura inicial, siete pasos, retroceso, finalización, omisión, Escape, repetición desde otra sección, persistencia sin almacenamiento local, otro usuario y recuperación de una escritura fallida; pruebas en escritorio y móvil.
- Los guardados y las API del navegador se simulan; estas pruebas no escriben datos financieros reales.
- Capturas del recorrido en `output/verification/tour-*.png` (no versionadas).

Verificado el 16/10/2026: 28 pruebas funcionales aprobadas, lint, tipos y compilación de producción correctos. La suite de navegador pasó con el recorrido en 320, 390, 768, 844 (horizontal), 1024, 1100 y 1440 píxeles, comprobando que el título y los controles permanezcan visibles. Se revisaron las capturas y se volvió a ejecutar la suite existente de acceso y gestión.
