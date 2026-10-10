export const APP_BREAKPOINT = 640;

export const isWideContainer = (el: Element | null): boolean =>
  !!el && (el as HTMLElement).clientWidth >= APP_BREAKPOINT;
