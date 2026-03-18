import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

import App from "./App.tsx";
import "./index.css";
import { AppContextProvider } from "./context/AppContext.tsx";
import { store } from "./store/index.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <AppContextProvider>
        <BrowserRouter>
          <Toaster richColors position="top-right" />
          <App />
        </BrowserRouter>
      </AppContextProvider>
    </Provider>
  </StrictMode>,
);
