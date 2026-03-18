import { createContext, useContext, useMemo, useState } from "react";

type AppContextValue = {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const value = useMemo(() => ({ sidebarOpen, setSidebarOpen }), [sidebarOpen]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppContextProvider");
  }

  return context;
};