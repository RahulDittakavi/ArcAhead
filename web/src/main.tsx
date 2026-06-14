import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/tokens.css";
import { App } from "./App";
import { EpisodeProvider } from "./lib/episode";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EpisodeProvider maxEp={1122}>
      <App />
    </EpisodeProvider>
  </StrictMode>
);
