import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Gestion du routage côté client pour les SPA
const urlParams = new URLSearchParams(window.location.search);
const redirectPath = urlParams.get("p");
if (redirectPath) {
  window.history.replaceState(null, "", redirectPath + window.location.hash);
}
const rootEl = document.getElementById("root")!;
const root = createRoot(rootEl);

// Disable StrictMode in development to silence third-party warnings (e.g., ReactQuill findDOMNode)
const appTree = import.meta.env.PROD ? (
  <StrictMode>
    <App />
  </StrictMode>
) : (
  <App />
);

root.render(appTree);
