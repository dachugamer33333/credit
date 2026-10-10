export type RouteKey =
  | "inicio"
  | "simulador"
  | "perfil"
  | "avisos"
  | "pagar-hub"
  | "pagar-credito"
  | "pagar-digital"
  | "pagar-servicios"
  | "pagar-recarga"
  | "comprobante"
  | "historial"
  | "transferir";
export type NavKey = "inicio" | "prestamo" | "perfil";

const HASH_TO_SCREEN: Record<string, RouteKey> = {
  "#": "inicio",
  "#/": "inicio",
  "#/inicio": "inicio",
  "#/simulador": "simulador",
  "#/perfil": "perfil",
  "#/perfil/avisos": "avisos",
  "#/pagar": "pagar-hub",
  "#/pagar/credito": "pagar-credito",
  "#/pagar/digital": "pagar-digital",
  "#/pagar/servicios": "pagar-servicios",
  "#/pagar/recarga": "pagar-recarga",
  "#/comprobante": "comprobante",
  "#/historial": "historial",
  "#/transferir": "transferir",
};

const SCREEN_TO_NAV: Record<RouteKey, NavKey> = {
  inicio: "inicio",
  simulador: "prestamo",
  perfil: "perfil",
  avisos: "perfil",
  "pagar-hub": "inicio",
  "pagar-credito": "inicio",
  "pagar-digital": "inicio",
  "pagar-servicios": "inicio",
  "pagar-recarga": "inicio",
  comprobante: "inicio",
  historial: "inicio",
  transferir: "inicio",
};

export const routeFromHash = (hash: string): RouteKey => HASH_TO_SCREEN[hash] ?? "inicio";

export function initRouter(root: ParentNode = document): void {
  const screens = Array.from(root.querySelectorAll<HTMLElement>("[data-screen]"));
  const navLinks = Array.from(root.querySelectorAll<HTMLElement>("[data-nav]"));
  const main = root.querySelector<HTMLElement>("[data-app-main]");

  const apply = (focusTitle: boolean) => {
    const key = routeFromHash(window.location.hash);

    screens.forEach((screen) => {
      const active = screen.dataset.screen === key;
      const wasHidden = screen.hidden;
      screen.hidden = !active;
      screen.setAttribute("aria-hidden", active ? "false" : "true");
      if (active && wasHidden) {
        screen.classList.remove("screen-enter");
        // Reinicia la animación de entrada.
        void screen.offsetWidth;
        screen.classList.add("screen-enter");
      }
    });

    const currentNav = SCREEN_TO_NAV[key];
    navLinks.forEach((link) => {
      const active = link.dataset.nav === currentNav;
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    if (main) main.scrollTop = 0;

    if (focusTitle) {
      const title = root.querySelector<HTMLElement>(
        `[data-screen="${key}"] [data-screen-title]`
      );
      title?.focus();
    }
  };

  if (!window.location.hash) {
    history.replaceState(null, "", "#/inicio");
  }

  apply(false);

  window.addEventListener("hashchange", () => apply(true));
}
