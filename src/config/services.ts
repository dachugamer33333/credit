export interface Service {
  id: string;
  nombre: string;
  categoria: string;
  longitudReferencia: number;
  ayuda: string;
}

export const serviceCategories = [
  "Electricidad",
  "Agua",
  "Gas",
  "Telefonía e Internet",
] as const;

// Catálogo de demostración (longitudes y ayudas ficticias).
export const services: Service[] = [
  {
    id: "cfe",
    nombre: "CFE",
    categoria: "Electricidad",
    longitudReferencia: 12,
    ayuda: "Número de servicio de 12 dígitos.",
  },
  {
    id: "odapas",
    nombre: "ODAPAS",
    categoria: "Agua",
    longitudReferencia: 10,
    ayuda: "Cuenta de 10 dígitos.",
  },
  {
    id: "sacmex",
    nombre: "SACMEX",
    categoria: "Agua",
    longitudReferencia: 11,
    ayuda: "Número de cuenta de 11 dígitos.",
  },
  {
    id: "naturgy",
    nombre: "Naturgy",
    categoria: "Gas",
    longitudReferencia: 12,
    ayuda: "Número de cliente de 12 dígitos.",
  },
  {
    id: "telmex",
    nombre: "Telmex",
    categoria: "Telefonía e Internet",
    longitudReferencia: 10,
    ayuda: "Número telefónico de 10 dígitos.",
  },
  {
    id: "izzi",
    nombre: "Izzi",
    categoria: "Telefonía e Internet",
    longitudReferencia: 10,
    ayuda: "Cuenta de 10 dígitos.",
  },
  {
    id: "totalplay",
    nombre: "Totalplay",
    categoria: "Telefonía e Internet",
    longitudReferencia: 10,
    ayuda: "Cuenta de 10 dígitos.",
  },
  {
    id: "megacable",
    nombre: "Megacable",
    categoria: "Telefonía e Internet",
    longitudReferencia: 10,
    ayuda: "Contrato de 10 dígitos.",
  },
];

export interface Operator {
  id: string;
  nombre: string;
  iniciales: string;
}

export const operators: Operator[] = [
  { id: "telcel", nombre: "Telcel", iniciales: "TC" },
  { id: "att", nombre: "AT&T", iniciales: "AT" },
  { id: "movistar", nombre: "Movistar", iniciales: "MV" },
  { id: "bait", nombre: "Bait", iniciales: "BT" },
  { id: "unefon", nombre: "Unefon", iniciales: "UF" },
  { id: "virgin", nombre: "Virgin Mobile", iniciales: "VM" },
];

export const topupAmounts = [20, 30, 50, 100, 150, 200, 300, 500];
