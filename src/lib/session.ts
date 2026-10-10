const SESSION_KEY = "encredit:session";

export const hasVerifiedSession = (): boolean => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "verified";
  } catch {
    return false;
  }
};

export const markSessionVerified = (): void => {
  try {
    window.sessionStorage.setItem(SESSION_KEY, "verified");
  } catch {
    // Sin persistencia de sesión: se pedirá verificación de nuevo.
  }
};

export const clearSession = (): void => {
  try {
    window.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nada que limpiar.
  }
};
