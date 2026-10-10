export interface DemoUser {
  name: string;
  email: string;
  accountType: string;
  status: string;
  memberSince: string;
}

export interface Movement {
  id: string;
  description: string;
  amount: number;
  direction: "debito" | "credito";
  daysAgo: number;
}

export interface ConditionRow {
  label: string;
  value: string;
}

export const demoUser: DemoUser = {
  name: "Juan Pérez",
  email: "juan.perez@ejemplo.mx",
  accountType: "Línea de crédito",
  status: "Cuenta activa",
  memberSince: "2024-03-12",
};

export const credit = {
  limit: 20000,
  used: 1500,
  available: 20000 - 1500,
  paymentDay: 15,
  nextPaymentAmount: 850,
} as const;

// Movimientos recientes ficticios (relativos a hoy para que no envejezcan).
export const movements: Movement[] = [
  {
    id: "mov-1",
    description: "Adelanto para rodaje",
    amount: 800,
    direction: "debito",
    daysAgo: 2,
  },
  {
    id: "mov-2",
    description: "Renta de equipo de iluminación",
    amount: 500,
    direction: "debito",
    daysAgo: 6,
  },
  {
    id: "mov-3",
    description: "Pago a la cuenta",
    amount: 1200,
    direction: "credito",
    daysAgo: 11,
  },
];

// Condiciones del producto (valores provisionales de demostración).
export const interestRates: ConditionRow[] = [
  { label: "Tasa fija anual — Tarjeta Semilla", value: "22%" },
  { label: "Tasa fija anual — Tarjeta Escena", value: "17%" },
  { label: "Tasa moratoria", value: "No aplica en este prototipo" },
];

export const cat = {
  value: "47.9% – 58.4% sin IVA",
  note: "CAT promedio. El costo depende del monto y plazo elegidos.",
};

export const fees: ConditionRow[] = [
  { label: "Comisión por apertura", value: "$0" },
  { label: "Anualidad", value: "$0" },
  { label: "Comisión por disposición", value: "No aplica en este prototipo" },
];

export const terms: ConditionRow[] = [
  { label: "Monto mínimo", value: "$5,000 MXN" },
  { label: "Monto máximo", value: "$70,000 MXN" },
  { label: "Plazos disponibles", value: "6 a 36 meses" },
  { label: "Día de pago", value: "15 de cada mes" },
];

export const privacyExampleText =
  "Este aviso es un texto de ejemplo para el prototipo. El nombre que escribes de forma opcional se guarda únicamente en el almacenamiento local de este dispositivo y no se envía a ningún servidor. No se solicitan permisos del navegador ni se recopilan datos de ubicación.";

export const contractReca = {
  title: "Contrato de adhesión (RECA)",
  registry: "Pendiente de definir",
  description:
    "Es el modelo de contrato de adhesión que se registra ante la autoridad correspondiente para su uso con las personas usuarias. En este prototipo no se incluye un contrato vigente.",
};

export const recas = {
  title: "RECAS",
  registry: "Pendiente de definir",
  description:
    "Corresponde al registro de contratos de adhesión del producto. En este prototipo no se incluyen números de registro ni documentos oficiales.",
};
