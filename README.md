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

- Registro de ingresos y gastos.
- Asociación de cada movimiento con una cuenta y una categoría.
- Listado de los movimientos recientes.
- Eliminación de movimientos.
- Actualización automática de los indicadores del panel después de cada cambio.

### Panel financiero

- Saldo acumulado a partir del historial registrado.
- Ingresos, gastos y ahorro del mes actual.
- Comparación porcentual con el mes anterior.
- Historial de hasta 36 meses.
- Gráfico de evolución para períodos de 6 meses, 1 año y 3 años.
- Resumen de presupuestos y dinero disponible.

### Presupuestos

- Creación de límites mensuales por categoría.
- Cálculo del gasto realizado en cada categoría.
- Indicador de progreso y aviso visual cuando se supera un límite.
- Restricción para evitar más de un presupuesto por categoría y mes.

### Movimientos recurrentes

- Creación de ingresos y gastos diarios, semanales o mensuales.
- Selección del día de la semana o del mes según la frecuencia.
- Cálculo de la próxima ejecución.
- Generación automática de movimientos mediante una tarea programada.
- Resumen de ingresos y gastos recurrentes en el panel.

### Categorías y notificaciones

- Creación de categorías personalizadas con nombre, color e icono.
- Clasificación de cada categoría como ingreso o gasto.
- Centro de notificaciones con contador de pendientes.
- Marcado individual o conjunto de notificaciones como leídas.
- Avisos generados al crear determinadas operaciones y al procesar movimientos recurrentes.

## Estado de las secciones

| Área | Estado |
| --- | --- |
| Registro, inicio y cierre de sesión | Funcional |
| Creación y eliminación de movimientos | Funcional |
| Edición de movimientos | En desarrollo |
| Cuentas y categorías iniciales | Funcional |
| Categorías personalizadas | Funcional |
| Presupuestos mensuales | Funcional, con gestión avanzada pendiente |
| Movimientos recurrentes | Funcional, en proceso de refuerzo para producción |
| Historial y evolución del saldo | Funcional |
| Gastos por categoría | Interfaz creada; integración con datos reales pendiente |
| Objetivos de ahorro | Interfaz de demostración; persistencia pendiente |
| Búsqueda y navegación secundaria | Interfaz creada; comportamiento pendiente |

## Tecnologías utilizadas

| Tecnología | Uso en el proyecto |
| --- | --- |
| [Next.js 16](https://nextjs.org/) | Aplicación full stack con App Router, Route Handlers y Server Actions |
| [React 19](https://react.dev/) | Construcción de la interfaz |
| [TypeScript](https://www.typescriptlang.org/) | Tipado estático |
| [PostgreSQL](https://www.postgresql.org/) | Persistencia de usuarios y datos financieros |
| [Prisma 7](https://www.prisma.io/) | Modelo de datos, migraciones y consultas |
| [TanStack Query](https://tanstack.com/query) | Consultas, caché e invalidación de datos en el cliente |
| [Tailwind CSS 4](https://tailwindcss.com/) | Estilos y diseño adaptable |
| [Base UI](https://base-ui.com/) y componentes de shadcn | Componentes accesibles de interfaz |
| [Recharts](https://recharts.org/) | Gráficos financieros |
| [Framer Motion](https://www.framer.com/motion/) | Animaciones y transiciones |
| [date-fns](https://date-fns.org/) | Cálculos de fechas y períodos |
| [Argon2](https://github.com/ranisalt/node-argon2) | Hash seguro de contraseñas |
| [Lucide](https://lucide.dev/) | Iconografía |
| [Sonner](https://sonner.emilkowal.ski/) | Mensajes de confirmación y error |

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

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera la versión optimizada para producción |
| `npm run start` | Ejecuta la versión de producción |
| `npm run lint` | Revisa la calidad y consistencia del código |
| `npx prisma generate` | Genera el cliente de Prisma |
| `npx prisma migrate dev` | Aplica migraciones en desarrollo |

## Decisiones del proyecto

- **Aplicación full stack en un solo repositorio:** Next.js contiene tanto la interfaz como las operaciones del servidor.
- **Separación por dominio:** las funcionalidades se agrupan por el problema que resuelven y no solamente por el tipo de archivo.
- **Cálculos en el servidor:** los totales y agrupamientos financieros se obtienen desde PostgreSQL para evitar descargar todo el historial al cliente.
- **Precisión monetaria:** PostgreSQL y Prisma utilizan `Decimal(12, 2)` para los importes persistidos.
- **Consultas paralelas:** el panel obtiene varias métricas simultáneamente para reducir el tiempo de carga.
- **Interfaz adaptable:** el panel está preparado para diferentes tamaños de pantalla y cuenta con estados de carga y respuestas visuales.

## Próximos pasos

- Completar la edición de movimientos.
- Conectar el gráfico de categorías con datos reales.
- Implementar objetivos de ahorro persistentes.
- Agregar gestión completa de cuentas, categorías y presupuestos.
- Incorporar transferencias entre cuentas.
- Reforzar la idempotencia y autorización del proceso de movimientos recurrentes.
- Mejorar la validación del servidor y el tratamiento de errores.
- Añadir pruebas para cálculos financieros, fechas y flujos críticos.
- Permitir exportar y respaldar el historial financiero.
- Completar búsqueda, filtros y vistas de detalle.

## Contexto

Vaulty es un proyecto personal creado para resolver una necesidad concreta: comprender mejor los hábitos financieros a partir de datos propios. También forma parte de un portfolio y muestra el desarrollo de un producto completo, desde el diseño de la interfaz y el modelado de datos hasta autenticación, consultas agregadas y automatización de operaciones periódicas.
