import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { TransactionProvider } from "./context/TransactionContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TransactionProvider>
          <App />
        </TransactionProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
);
