import { reset } from "./account";
import { resetDefaults as resetRecipients } from "./recipients";

// Restablecer demo: cuenta (saldo/movimientos/congelado) + destinatarios guardados.
export const resetDemo = (): void => {
  reset();
  resetRecipients();
};
