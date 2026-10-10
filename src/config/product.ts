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

// Parámetros del simulador (valores provisionales de demostración).
// Cambiar cualquier valor aquí actualiza el simulador y los Avisos.
export interface LoanConfig {
  tasaAnual: number;
  ivaIntereses: number;
  comision: number;
  montoMinimo: number;
  montoMaximo: number;
  montoInicial: number;
  pasoMonto: number;
  plazos: number[];
  plazoInicial: number;
}

export const loanConfig: LoanConfig = {
  tasaAnual: 0.22,
  ivaIntereses: 0.16,
  comision: 0,
  montoMinimo: 1000,
  montoMaximo: 8000,
  montoInicial: 5000,
  pasoMonto: 500,
  plazos: [3, 6, 9],
  plazoInicial: 6,
};

const money = (value: number): string => `$${value.toLocaleString("es-MX")}`;
const percent = (value: number): string =>
  `${(value * 100).toLocaleString("es-MX", { maximumFractionDigits: 2 })}%`;

// Condiciones del producto derivadas de loanConfig.
export const interestRates: ConditionRow[] = [
  { label: "Tasa fija anual aplicable", value: percent(loanConfig.tasaAnual) },
  { label: "IVA sobre intereses", value: percent(loanConfig.ivaIntereses) },
  { label: "Tasa moratoria", value: "No aplica en este prototipo" },
];

export const cat = {
  note: "CAT demostrativo. El costo depende del monto y plazo simulado.",
};

export const fees: ConditionRow[] = [
  { label: "Comisión por apertura", value: money(loanConfig.comision) },
  { label: "Anualidad", value: "$0" },
  { label: "Comisión por disposición", value: "No aplica en este prototipo" },
];

export const terms: ConditionRow[] = [
  { label: "Monto mínimo", value: `${money(loanConfig.montoMinimo)} MXN` },
  { label: "Monto máximo", value: `${money(loanConfig.montoMaximo)} MXN` },
  {
    label: "Plazos disponibles",
    value: `${loanConfig.plazos.join(", ")} meses`,
  },
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
