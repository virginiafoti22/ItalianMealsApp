import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import { AppTheme, darkTheme, lightTheme } from "../theme/colors";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const initialMode: ThemeMode = systemScheme === "dark" ? "dark" : "light";

  const [mode, setMode] = useState<ThemeMode>(initialMode);

  const toggleTheme = () => {
    setMode((current) => (current === "light" ? "dark" : "light"));
  };

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      toggleTheme,
    }),
    [theme, mode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme deve essere usato dentro ThemeProvider");
  }

  return context;
}