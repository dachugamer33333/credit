export interface DemoUser {
  name: string;
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

// Parámetros de pago (demostración).
export const paymentConfig = {
  pagoMinimoPorcentaje: 0.1,
  pagoMinimoPiso: 100,
} as const;

// Tarjeta virtual ficticia (demostración).
export const virtualCard = {
  number: "4821 0000 1234 4821",
  last4: "4821",
  expiry: "12/29",
} as const;

// Parámetros de transferencia (demostración).
export const transferConfig = {
  comision: 0,
} as const;

// Cuenta propia del usuario (demostración). Rechaza transferencias a sí misma.
export const ownAccount = {
  numero: "1234567890",
  banco: "EN CREDIT",
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

// Parámetros del simulador, alineados a las condiciones fijas (fixedTerms).
export interface LoanConfig {
  tasaMensualSimple: number;
  comisionApertura: number;
  iva: number;
  montoMinimo: number;
  montoMaximo: number;
  montoInicial: number;
  pasoMonto: number;
  plazos: number[];
  plazoInicial: number;
}

export const loanConfig: LoanConfig = {
  tasaMensualSimple: 0.2,
  comisionApertura: 300,
  iva: 0,
  montoMinimo: 3500,
  montoMaximo: 8000,
  montoInicial: 3500,
  pasoMonto: 500,
  plazos: [3, 6, 9],
  plazoInicial: 6,
};

const money = (value: number): string => `$${value.toLocaleString("es-MX")}`;

export const terms: ConditionRow[] = [
  { label: "Monto mínimo", value: `${money(loanConfig.montoMinimo)} MXN` },
  { label: "Monto máximo", value: `${money(loanConfig.montoMaximo)} MXN` },
  {
    label: "Plazos disponibles",
    value: `${loanConfig.plazos.join(", ")} meses`,
  },
  { label: "Día de pago", value: "15 de cada mes" },
];

// Condiciones fijas del crédito (documento "Condiciones fijas del crédito y cálculo del CAT").
// Única fuente de verdad para los apartados 1–3 de Avisos y privacidad.
// Porcentajes expresados como puntos (240 = 240.00%).
export const fixedTerms = {
  entidad: "EN CREDIT, S.A. de C.V., SOFOM, E.N.R.",
  monto: 3500,
  plazoMeses: 6,
  comisionApertura: 300,
  montoNetoRecibido: 3200,
  tasaOrdinariaAnual: 240,
  tasaOrdinariaMensualSimple: 20,
  tasaMoratoriaMensual: 25,
  equivalenciaMoraAnual: 300,
  comisionPagoTardio: 0,
  pagoMensual1a5: 1283.33,
  pagoMensual6: 1283.35,
  interesMensual: 700,
  interesTotal: 4200,
  totalPagos: 7700,
  totalPagadoConApertura: 8000,
  catMensual: 32.79,
  catAnual: 2905.7,
  fuenteMetodologica:
    "Banco de México, Circular 21/2009 (metodología del CAT). CONDUSEF: Registro de Contratos de Adhesión y Registro de Comisiones.",
  // Datos de ejemplo para la tabla de interés moratorio (apartado 1).
  capitalVencidoEjemplo: 583.33,
  pagoVencidoEjemplo: 1283.33,
  diasMoraEjemplo: [1, 7, 15, 30, 60],
} as const;

export const privacyExampleText =
  "Este aviso es un texto de ejemplo para el prototipo. El nombre que escribes de forma opcional y los destinatarios guardados se almacenan únicamente en el almacenamiento local de este dispositivo y no se envían a ningún servidor. No se solicitan permisos del navegador ni se recopilan datos de ubicación.";

export const contractReca = {
  title: "Contrato de adhesión (RECA)",
  registry: "Pendiente de definir",
  description:
    "Es el modelo de contrato de adhesión que se registra ante la autoridad correspondiente para su uso con las personas usuarias. En este prototipo no se incluye un contrato vigente.",
};

// Número de registro RECA (fuente única). "Pendiente de definir".
export const recaNumber = "Pendiente de definir";

export const recas = {
  title: "RECAS",
  registry: "Pendiente de definir",
  description:
    "Corresponde al registro de contratos de adhesión del producto. En este prototipo no se incluyen números de registro ni documentos oficiales.",
};
