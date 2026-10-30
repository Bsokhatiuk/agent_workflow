import "@telegram-apps/telegram-ui/dist/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { bindThemeParamsCssVars, init, isTMA, mountThemeParamsSync } from "@telegram-apps/sdk-react";
import { AppRoot } from "@telegram-apps/telegram-ui";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

// In a plain browser tab there are no launch params: skip the SDK and render with default theming.
if (isTMA()) {
  init();
  mountThemeParamsSync();
  bindThemeParamsCssVars(); // exposes --tg-theme-* CSS variables
}

const queryClient = new QueryClient();

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRoot>
        <App />
      </AppRoot>
    </QueryClientProvider>
  </StrictMode>,
);
