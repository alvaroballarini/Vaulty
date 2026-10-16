export const tourSteps = [
  {
    target: "overview",
    title: "Tu dinero, de un vistazo",
    description:
      "Bienvenido a Vaulty. En este recorrido vas a ver cómo organizar tu dinero. Este resumen reúne tu saldo y los ingresos y gastos del mes, según los movimientos que registres.",
    hint: "7 pasos · Aproximadamente un minuto",
  },
  {
    target: "accounts",
    title: "Organizá tus cuentas",
    description:
      "Entrá desde este resumen para agregar o editar tus cuentas de banco, billetera o efectivo. Al registrar un movimiento, elegí la cuenta a la que pertenece.",
    hint: "También en Cuentas · En el celular, dentro de Más.",
  },
  {
    target: "register",
    title: "Registrá tu primer movimiento",
    description:
      "Elegí gasto o ingreso, ingresá el importe y seleccioná una cuenta y una categoría. Revisá la fecha y guardalo: el resumen se actualiza con ese movimiento.",
    hint: "El botón Registrar te lleva a un formulario con más espacio.",
  },
  {
    target: "history",
    title: "Encontrá y corregí movimientos",
    description:
      "Abrí el historial completo para buscar por concepto y filtrar por fecha, cuenta o categoría. Desde el menú de cada movimiento podés editarlo o eliminarlo.",
    hint: "Un dato mal cargado se puede corregir sin empezar de nuevo.",
  },
  {
    target: "budgets",
    title: "Dale un límite a tus gastos",
    description:
      "Creá un presupuesto mensual para una categoría, como Alimentación. Los gastos que registres en ella se comparan con ese límite para que puedas seguir cuánto llevás usado.",
    hint: "También en Presupuestos · En el celular, dentro de Más.",
  },
  {
    target: "planning",
    title: "Anticipá lo que viene",
    description:
      "En Planificación podés programar pagos o ingresos recurrentes, definir su próxima fecha y pausarlos cuando lo necesites. Acá vas a ver las próximas fechas y sus importes estimados.",
    hint: "Estos registros organizan tus finanzas; no hacen pagos bancarios.",
  },
  {
    target: "privacy",
    title: "Usá Vaulty a tu manera",
    description:
      "El ojo oculta los importes cuando necesitás privacidad. Para volver a este recorrido, abrí Mi perfil y elegí Ver recorrido guiado. Ya podés empezar con tu primer movimiento.",
    hint: "Podés omitir el recorrido y retomarlo desde tu perfil.",
  },
] as const;
