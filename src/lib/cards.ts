import { banks, type Bank } from "../config/banks.ts";

export type Brand = "visa" | "mastercard" | "amex" | "desconocida";
export type Kind = "cuenta" | "tarjeta" | "clabe" | "invalido";

export const digitsOnly = (value: string): string => value.replace(/\D/g, "");

export const groupDigits = (digits: string): string =>
  digitsOnly(digits).replace(/(\d{4})(?=\d)/g, "$1 ");

export const maskDigits = (digits: string): string => {
  const d = digitsOnly(digits);
  if (d.length <= 4) return d;
  return "•".repeat(d.length - 4) + d.slice(-4);
};

export const detectBrand = (digits: string): Brand => {
  const d = digitsOnly(digits);
  if (/^4/.test(d)) return "visa";
  if (/^3[47]/.test(d)) return "amex";
  const n2 = Number(d.slice(0, 2));
  const n4 = Number(d.slice(0, 4));
  if ((n2 >= 51 && n2 <= 55) || (n4 >= 2221 && n4 <= 2720)) return "mastercard";
  return "desconocida";
};

export const brandLabel = (brand: Brand): string => {
  if (brand === "visa") return "Visa";
  if (brand === "mastercard") return "Mastercard";
  if (brand === "amex") return "American Express";
  return "Desconocida";
};

export const luhn = (digits: string): boolean => {
  const d = digitsOnly(digits);
  if (d.length < 2) return false;
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
};

// Dígito verificador Luhn para anexar al final del cuerpo.
export const luhnCheckDigit = (body: string): number => {
  const d = digitsOnly(body);
  let sum = 0;
  let double = true;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (double) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    double = !double;
  }
  return (10 - (sum % 10)) % 10;
};

export const clabeValid = (digits: string): boolean => {
  const d = digitsOnly(digits);
  if (d.length !== 18) return false;
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += (Number(d[i]) * weights[i % 3]) % 10;
  }
  const check = (10 - (sum % 10)) % 10;
  return check === Number(d[17]);
};

export const clabeCheckDigit = (first17: string): number => {
  const d = digitsOnly(first17);
  const weights = [3, 7, 1];
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    sum += (Number(d[i]) * weights[i % 3]) % 10;
  }
  return (10 - (sum % 10)) % 10;
};

export const bankFromClabe = (digits: string): Bank | undefined => {
  const d = digitsOnly(digits);
  if (d.length < 3) return undefined;
  return banks.find((bank) => bank.code === d.slice(0, 3));
};

export const detectKind = (digits: string): Kind => {
  const d = digitsOnly(digits);
  if (d.length === 10) return "cuenta";
  if (d.length === 15 || d.length === 16) return "tarjeta";
  if (d.length === 18) return "clabe";
  return "invalido";
};

const randomDigits = (n: number): string => {
  let out = "";
  for (let i = 0; i < n; i++) out += String(Math.floor(Math.random() * 10));
  return out;
};

const randomAlnum = (n: number): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let out = "";
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

export const generateReference = (): string => randomDigits(7);

export const generateTrackingKey = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `ENC${year}${month}${day}${randomAlnum(10)}`;
};

export const makeSampleCard = (brand: Brand = "visa"): string => {
  const length = brand === "amex" ? 15 : 16;
  let prefix = "4";
  if (brand === "mastercard") prefix = `5${1 + Math.floor(Math.random() * 5)}`;
  else if (brand === "amex") prefix = Math.random() < 0.5 ? "34" : "37";
  const body = prefix + randomDigits(length - prefix.length - 1);
  return body + String(luhnCheckDigit(body));
};

export const makeSampleClabe = (bankCode = "012"): string => {
  const first17 = digitsOnly(bankCode).padStart(3, "0") + randomDigits(3) + randomDigits(11);
  return first17 + String(clabeCheckDigit(first17));
};
