export const formatMXN = (value: number, decimals = 0): string =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

export const formatDateEsMx = (
  date: Date,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }
): string => new Intl.DateTimeFormat("es-MX", options).format(date);

// Próximo pago: día `paymentDay` de este mes; si ya pasó, del mes siguiente.
export const getNextPaymentDate = (now: Date = new Date(), paymentDay = 15): Date => {
  const year = now.getFullYear();
  const month = now.getMonth();
  if (now.getDate() > paymentDay) {
    return new Date(year, month + 1, paymentDay);
  }
  return new Date(year, month, paymentDay);
};

export const getMovementDate = (daysAgo: number, now: Date = new Date()): Date =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo);
