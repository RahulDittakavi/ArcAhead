import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { App } from "./App";
import { EpisodeProvider } from "./lib/episode";
import { AuthProvider } from "./lib/auth";
import { SyncBridge } from "./components/SyncBridge";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <EpisodeProvider maxEp={1166}>
        <SyncBridge />
        <App />
      </EpisodeProvider>
    </AuthProvider>
  </StrictMode>
);

// Register the service worker for offline/installable PWA. Production only, so
// the dev server's hot reload is never intercepted by a cache.
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* offline support is a progressive enhancement; ignore failures */
    });
  });
}
