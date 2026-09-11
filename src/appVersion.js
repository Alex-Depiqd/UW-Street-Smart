export const APP_VERSION = import.meta.env.VITE_APP_VERSION || "0.0.0-dev";
export const APP_VERSION_LABEL = import.meta.env.VITE_APP_VERSION_LABEL || `v${APP_VERSION}`;
export const APP_GIT_SHA = import.meta.env.VITE_APP_GIT_SHA || "";
export const APP_CHANNEL = import.meta.env.VITE_APP_CHANNEL || "dev";
export const APP_COPYRIGHT_YEAR = new Date().getFullYear();

export function channelLabel(channel = APP_CHANNEL) {
  if (channel === "production") return "Production";
  if (channel === "preview") return "Preview";
  return "Local";
}
