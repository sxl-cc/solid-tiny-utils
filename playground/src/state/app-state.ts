import { createRoot } from "solid-js";
import { createStaticStore } from "~/solidjs";

const appState = createRoot(() =>
  createStaticStore({
    isDark: false,
    hue: 165,
  })
);

export function useAppState() {
  return appState;
}
