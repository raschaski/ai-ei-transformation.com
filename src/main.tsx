import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { initializeNativeAuth, isNativeApp } from "./lib/supabase";
import "./styles.css";

void initializeNativeAuth();

if (!isNativeApp && import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
    }).catch((error) => console.warn("Service Worker konnte nicht registriert werden.", error));
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
