# Vaulty

Panel web de finanzas personales para registrar movimientos, organizar gastos y entender la evolución del dinero desde un único lugar.

Vaulty nació como una herramienta de uso personal y real. El proyecto busca convertir el registro cotidiano de ingresos y gastos en información clara: saldo acumulado, ahorro mensual, presupuestos, próximos movimientos recurrentes e historial financiero.

> **Estado:** proyecto en desarrollo activo. El flujo principal ya funciona, mientras que algunas secciones visuales y operaciones de gestión todavía están en construcción.

## Funcionalidades actuales

### Autenticación y usuarios

- Registro e inicio de sesión con correo y contraseña.
- Contraseñas protegidas con Argon2.
- Sesiones persistentes almacenadas en PostgreSQL.
- Cierre de sesión e invalidación de la sesión activa.
- Creación automática de cuentas y categorías iniciales para cada usuario.

### Movimientos

- Registro rápido de ingresos y gastos desde el panel, con importes argentinos (por ejemplo, `18.500,50`).
- Selección de cuenta, categorías según el tipo de movimiento, fecha y nota opcional.
- Recuerdo de la última cuenta elegida por usuario en el navegador.
- Edición con datos precargados, validación en servidor y confirmación antes de eliminar.
- Conservación del borrador cuando falla el guardado.
- Asociación de cada movimiento con una cuenta y una categoría.
- Listado y búsqueda entre los últimos 10 movimientos (no busca en todo el historial).
- Eliminación de movimientos.
- Actualización automática de los indicadores del panel después de cada cambio.

### Panel financiero

- Saldo acumulado a partir del historial registrado.
- Ingresos, gastos y ahorro del mes actual.
- Saldos por cuenta calculados hasta el momento de consulta.
- Historial de hasta 36 meses.
- Gráfico de evolución con vistas de 6 meses y 1 año, más una alternativa textual accesible.
- Estimación del saldo tras gastos programados de los próximos 14 días; no suma ingresos futuros.
- La estimación se omite si hay fechas programadas vencidas o sin definir.
- Opción de ocultar importes, incluidos gráfico y notificaciones.
- Tema oscuro esmeralda, alertas ámbar y navegación adaptada a móvil.
- Estados de carga, vacío, error y reintento con datos reales.

### Presupuestos

- Creación y actualización de límites mensuales por categoría de gasto.
- Cálculo del gasto realizado en cada categoría.
- Indicador de progreso y aviso visual cuando se supera un límite.
- Restricción para evitar más de un presupuesto por categoría y mes.

### Movimientos recurrentes

- Creación de ingresos y gastos diarios, semanales o mensuales.
- Selección del día de la semana o del mes según la frecuencia.
- Cálculo de la próxima ejecución.
- Generación automática de movimientos mediante una tarea programada.
- Próximos pagos e ingresos a partir de las fechas programadas almacenadas.

### Categorías y notificaciones

- Creación de categorías personalizadas con nombre, color e icono.
- Clasificación de cada categoría como ingreso o gasto.
- Centro de notificaciones con contador de pendientes.
- Marcado individual o conjunto de notificaciones como leídas.
- Avisos generados al crear determinadas operaciones y al procesar movimientos recurrentes.

## Estado de las secciones

| Área                                                      | Estado                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| Registro, inicio y cierre de sesión                       | Funcional                                                    |
| Registro, edición y eliminación de movimientos            | Funcional                                                    |
| Cuentas y categorías iniciales                            | Funcional                                                    |
| Creación de cuentas y consulta de saldos                  | Funcional                                                    |
| Categorías personalizadas                                 | Funcional                                                    |
| Presupuestos mensuales                                    | Funcional, con gestión avanzada pendiente                    |
| Movimientos recurrentes                                   | Funcional, en proceso de refuerzo para producción            |
| Historial y evolución del saldo                           | Funcional                                                    |
| Gráfico de gastos por categoría                           | Componente previo pendiente de integración; fuera del inicio |
| Objetivos de ahorro                                       | Prototipo sin persistencia; fuera del inicio                 |
| Búsqueda en movimientos recientes y navegación del panel  | Funcional                                                    |
| Búsqueda global, transferencias y edición de recurrencias | Pendiente                                                    |

## Tecnologías utilizadas

| Tecnología                                              | Uso en el proyecto                                                    |
| ------------------------------------------------------- | --------------------------------------------------------------------- |
| [Next.js 16](https://nextjs.org/)                       | Aplicación full stack con App Router, Route Handlers y Server Actions |
| [React 19](https://react.dev/)                          | Construcción de la interfaz                                           |
| [TypeScript](https://www.typescriptlang.org/)           | Tipado estático                                                       |
| [PostgreSQL](https://www.postgresql.org/)               | Persistencia de usuarios y datos financieros                          |
| [Prisma 7](https://www.prisma.io/)                      | Modelo de datos, migraciones y consultas                              |
| [TanStack Query](https://tanstack.com/query)            | Consultas, caché e invalidación de datos en el cliente                |
| [Tailwind CSS 4](https://tailwindcss.com/)              | Estilos y diseño adaptable                                            |
| [Base UI](https://base-ui.com/) y componentes de shadcn | Componentes accesibles de interfaz                                    |
| [Recharts](https://recharts.org/)                       | Gráficos financieros                                                  |
| [Framer Motion](https://www.framer.com/motion/)         | Animaciones y transiciones                                            |
| [date-fns](https://date-fns.org/) y date-fns-tz         | Fechas y zona horaria de Argentina                                    |
| [Zod](https://zod.dev/)                                 | Validación de datos en servidor                                       |
| [Playwright](https://playwright.dev/)                   | Pruebas de interfaz con datos simulados                               |
| [Prettier](https://prettier.io/)                        | Formato del código                                                    |
| [Argon2](https://github.com/ranisalt/node-argon2)       | Hash seguro de contraseñas                                            |
| [Lucide](https://lucide.dev/)                           | Iconografía                                                           |
| [Sonner](https://sonner.emilkowal.ski/)                 | Mensajes de confirmación y error                                      |

## Arquitectura

El código está organizado por funcionalidades. Cada módulo separa, cuando corresponde, componentes visuales, reglas de negocio, acceso a datos, tipos y validaciones.

```text
src/
├── app/                  # Páginas, layout y endpoints HTTP
├── components/           # Componentes compartidos y elementos de interfaz
├── features/
│   ├── account/          # Cuentas financieras
│   ├── auth/             # Autenticación y sesiones
│   ├── Budgets/          # Presupuestos mensuales
│   ├── categories/       # Categorías de movimientos
│   ├── dashboard/        # Métricas e historial financiero
│   ├── goals/            # Objetivos de ahorro
│   ├── notification/     # Centro de notificaciones
│   ├── RecurringTransaction/ # Procesamiento de recurrencias
│   ├── transactions/     # Ingresos y gastos
│   └── user/             # Datos del usuario
├── hooks/                # Consultas del panel
└── lib/                  # Prisma, fechas, formatos y utilidades

prisma/
├── migrations/           # Historial de cambios de la base de datos
└── schema.prisma         # Modelo relacional
```

El modelo principal relaciona cada usuario con sus cuentas, categorías, movimientos, presupuestos, recurrencias, notificaciones y sesiones. Los importes financieros se almacenan como valores decimales de dos posiciones.

## Instalación local

### Requisitos

- Node.js 20 o superior.
- npm.
- Una base de datos PostgreSQL.

### Configuración

1. Instalar las dependencias:

```bash
npm install
```

2. Crear un archivo `.env` en la raíz del proyecto:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/vaulty"
```

3. Generar el cliente de Prisma y aplicar las migraciones:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Iniciar el entorno de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

## Comandos disponibles

| Comando                  | Descripción                                               |
| ------------------------ | --------------------------------------------------------- |
| `npm run dev`            | Inicia el servidor de desarrollo                          |
| `npm run build`          | Genera la versión optimizada para producción              |
| `npm run start`          | Ejecuta la versión de producción                          |
| `npm run lint`           | Revisa la calidad y consistencia del código               |
| `npm run typecheck`      | Verifica los tipos sin generar archivos                   |
| `npm test`               | Prueba importes, fechas, previsión y permisos de guardado |
| `npm run test:ui`        | Prueba el panel en navegador contra un servidor local     |
| `npx prisma generate`    | Genera el cliente de Prisma                               |
| `npx prisma migrate dev` | Aplica migraciones en desarrollo                          |

## Verificación del panel

Las pruebas de interfaz usan datos ficticios e interceptan todas las llamadas a la API y los guardados. No escriben en la base real. Cubren escritorio (1440 px), móvil (390 px), tablet (768 px), privacidad, navegación, edición, validación, guardado simulado, conservación del borrador y estados vacíos/de error.

Con un servidor local en el puerto 3000:

```bash
npx playwright install chromium
npm run test:ui
```

También se puede usar un navegador instalado con la variable `BROWSER_CHANNEL=msedge` o `chrome`. Las capturas se generan en `output/verification/` y no se versionan. Las pruebas del servidor usan dobles de Prisma: verifican validación y autorización, pero no reemplazan una prueba integral con PostgreSQL.

## Alcance de los números

El saldo representa ingresos menos gastos registrados, no una conexión con el banco. Para incorporar dinero previo, se puede registrar un ingreso identificado como saldo inicial. Las transferencias todavía no tienen un flujo completo y no se incluyen como ingresos o gastos. El calendario y los límites mensuales usan `America/Argentina/Buenos_Aires`. El cron de recurrencias debe estar configurado para procesar pagos; el panel muestra avisos cuando sus fechas quedan atrasadas.

## Decisiones del proyecto

- **Aplicación full stack en un solo repositorio:** Next.js contiene tanto la interfaz como las operaciones del servidor.
- **Separación por dominio:** las funcionalidades se agrupan por el problema que resuelven y no solamente por el tipo de archivo.
- **Cálculos en el servidor:** los totales y agrupamientos financieros se obtienen desde PostgreSQL para evitar descargar todo el historial al cliente.
- **Precisión monetaria:** PostgreSQL y Prisma utilizan `Decimal(12, 2)` para los importes persistidos.
- **Consultas paralelas:** el panel obtiene varias métricas simultáneamente para reducir el tiempo de carga.
- **Interfaz adaptable:** el panel está preparado para diferentes tamaños de pantalla y cuenta con estados de carga y respuestas visuales.

## Próximos pasos

- Conectar el gráfico de categorías con datos reales.
- Implementar objetivos de ahorro persistentes.
- Agregar gestión completa de cuentas, categorías y presupuestos.
- Incorporar transferencias entre cuentas.
- Reforzar la idempotencia y autorización del proceso de movimientos recurrentes.
- Mejorar la validación del servidor y el tratamiento de errores.
- Ampliar las pruebas con una base PostgreSQL aislada y cobertura del procesamiento recurrente.
- Permitir exportar y respaldar el historial financiero.
- Agregar búsqueda global, paginación del historial y filtros por período.

## Contexto

Vaulty es un proyecto personal creado para resolver una necesidad concreta: comprender mejor los hábitos financieros a partir de datos propios. También forma parte de un portfolio y muestra el desarrollo de un producto completo, desde el diseño de la interfaz y el modelado de datos hasta autenticación, consultas agregadas y automatización de operaciones periódicas.
