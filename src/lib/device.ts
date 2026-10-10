export const isTouchDevice = (): boolean =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
