export interface Bank {
  code: string;
  name: string;
}

// Verificar contra el catálogo oficial de participantes SPEI de Banxico antes de cualquier uso real.
export const banks: Bank[] = [
  { code: "002", name: "Banamex" },
  { code: "012", name: "BBVA" },
  { code: "014", name: "Santander" },
  { code: "021", name: "HSBC" },
  { code: "072", name: "Banorte" },
  { code: "044", name: "Scotiabank" },
  { code: "036", name: "Inbursa" },
  { code: "127", name: "Banco Azteca" },
  { code: "137", name: "BanCoppel" },
  { code: "058", name: "Banregio" },
  { code: "062", name: "Afirme" },
  { code: "030", name: "BanBajío" },
  { code: "638", name: "Nu México" },
  { code: "722", name: "Mercado Pago" },
  { code: "646", name: "STP" },
  { code: "999", name: "EN CREDIT" },
];

export const EN_CREDIT_BANK: Bank = banks.find((bank) => bank.code === "999") ?? {
  code: "999",
  name: "EN CREDIT",
};
