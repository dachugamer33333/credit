let hideTimer: number | undefined;

export function showSnackbar(message: string, duration = 3200): void {
  const el = document.querySelector<HTMLElement>("[data-snackbar]");
  if (!el) return;

  const text = el.querySelector<HTMLElement>("[data-snackbar-text]");
  if (text) text.textContent = message;

  el.classList.add("snackbar-show");
  el.removeAttribute("aria-hidden");

  if (hideTimer) window.clearTimeout(hideTimer);
  hideTimer = window.setTimeout(() => {
    el.classList.remove("snackbar-show");
    el.setAttribute("aria-hidden", "true");
  }, duration);
}
