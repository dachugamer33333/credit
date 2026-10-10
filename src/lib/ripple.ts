export function initRipple(root: ParentNode = document): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  root.querySelectorAll<HTMLElement>("[data-ripple]").forEach((el) => {
    if (el.dataset.rippleReady === "1") return;
    el.dataset.rippleReady = "1";

    el.addEventListener("pointerdown", (event) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const wave = document.createElement("span");
      wave.className = "ripple-wave";
      wave.style.width = `${size}px`;
      wave.style.height = `${size}px`;
      wave.style.left = `${event.clientX - rect.left - size / 2}px`;
      wave.style.top = `${event.clientY - rect.top - size / 2}px`;
      el.appendChild(wave);
      wave.addEventListener("animationend", () => wave.remove());
    });
  });
}
