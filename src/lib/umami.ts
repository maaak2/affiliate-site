type UmamiEventData = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: UmamiEventData) => void;
    };
  }
}

/** No-ops safely if the Umami script hasn't loaded (e.g. ad blockers, SSR). */
export function trackEvent(eventName: string, eventData?: UmamiEventData): void {
  if (typeof window === "undefined") return;
  window.umami?.track(eventName, eventData);
}
