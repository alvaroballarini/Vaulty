# Acceso, gestión y acabado visual

Se conserva la identidad esmeralda con superficies sobrias, títulos por sección y controles táctiles más amplios.

## Navegación y gestión

- Inicio: resumen y registro rápido.
- Movimientos: historial completo con filtros y paginación.
- Los filtros avanzados se despliegan a pedido para mantener los resultados a mano en móvil.
- Cuentas: creación y edición de nombre y tipo, sin alterar movimientos.
- Presupuestos: límites del mes actual con edición precargada.
- Planificación: listado de activas y pausadas, filtro de fechas por revisar, edición y pausa/reanudación.
- Registrar: acceso directo desde escritorio y barra móvil.

La edición de una programación reemplaza su próximo vencimiento; los movimientos ya registrados se conservan. Al reanudar una programación vencida se omiten los períodos pausados y se calcula la próxima fecha futura.

El acceso usa un diseño compartido para registro e inicio, errores junto a los campos y una opción efectiva de mantener sesión. Recuperar contraseña permanece deshabilitado como Próximamente. La página /privacidad describe el almacenamiento real de datos y no constituye una política legal completa.

Los diálogos de edición de movimientos, presupuestos y planificación solicitan confirmación al descartar cambios, y no se cierran durante el guardado. Los campos se bloquean mientras se envían los datos. Los borradores de registro rápido todavía no se conservan al cambiar de pantalla.

## Configuración al publicar

Configurar el mismo valor privado de CRON_SECRET en el alojamiento y en los secretos de GitHub Actions. La ruta GET /api/cron/recurring-transactions exige Authorization: Bearer <CRON_SECRET>. Sin esa configuración responde 401 y no procesa movimientos. No guardar el secreto en el repositorio.

La programación se calcula a partir de las 12:00 de Argentina y depende de la ejecución de la tarea. Se conserva el día mensual original después de los meses cortos. Cada ejecución reclama la ocurrencia dentro de una transacción antes de registrarla.

No se modificó la base de datos durante esta revisión. El esquema Prisma ya contenía los campos utilizados por la planificación; la cadena histórica de migraciones del proyecto requiere una revisión independiente antes de preparar una base nueva desde cero.

## Verificación

- npm test: importes, acceso, sesiones, permisos, filtros, calendario y reclamación de ocurrencias.
- npm run typecheck y npm run lint: revisión estática.
- npm run test:ui: servidor local en 127.0.0.1:3000 y Playwright; BROWSER_CHANNEL=msedge permite usar Edge en Windows.
- La prueba visual intercepta API y escrituras con datos simulados. No prueba una conexión real a PostgreSQL.
- Capturas en output/verification, ignorado por Git.

## Fuera de este alcance

Recuperación de contraseña, transferencias entre cuentas, archivo de cuentas, gestión avanzada de categorías y saldos de apertura independientes del ingreso mensual.

## Resultado de la verificación del 15/10/2026

- 23 pruebas funcionales aprobadas.
- Análisis estático y comprobación de tipos aprobados.
- Compilación de producción aprobada; se limitó temporalmente a un trabajador por la memoria disponible y se restauró la configuración original.
- Suite de navegador aprobada sobre producción, con escritorio y anchos de 390, 768 y 1024 píxeles, edición, validación, guardado simulado, errores, filtros, privacidad y confirmación de descarte.
- No se modificaron datos reales ni se aplicaron migraciones.
- La revisión visual adicional empleó capturas y fuente. El detector impeccable no pudo ejecutarse por un error de su lanzador de Windows; no se obtuvo una auditoría automática completa de accesibilidad.
