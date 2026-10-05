import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import "./enhancements.css";
import { ComparisonProvider } from "./components/Comparison";
import { RouterProvider } from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider>
      <ComparisonProvider>
        <App />
      </ComparisonProvider>
    </RouterProvider>
  </React.StrictMode>,
);
