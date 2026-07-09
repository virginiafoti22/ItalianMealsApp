import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppTheme, darkTheme, lightTheme } from "../theme/colors";

type ThemeMode = "light" | "dark";

type ThemeContextValue = {
  theme: AppTheme;
  mode: ThemeMode;
  isDarkMode: boolean;
  isThemeLoaded: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
};

const THEME_STORAGE_KEY = "@theme_mode";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const systemMode: ThemeMode = systemScheme === "dark" ? "dark" : "light";

  const [mode, setModeState] = useState<ThemeMode>(systemMode);
  const [isThemeLoaded, setIsThemeLoaded] = useState(false);

  useEffect(() => {
    loadStoredTheme();
  }, []);

  useEffect(() => {
    if (!isThemeLoaded) {
      return;
    }

    persistTheme(mode);
  }, [mode, isThemeLoaded]);

  async function loadStoredTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);

      if (savedTheme === "dark" || savedTheme === "light") {
        setModeState(savedTheme);
      } else {
        setModeState(systemMode);
      }
    } catch (error) {
      console.log("Errore caricamento tema:", error);
      setModeState(systemMode);
    } finally {
      setIsThemeLoaded(true);
    }
  }

  async function persistTheme(nextMode: ThemeMode) {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, nextMode);
    } catch (error) {
      console.log("Errore salvataggio tema:", error);
    }
  }

  function toggleTheme() {
    setModeState((current) => (current === "light" ? "dark" : "light"));
  }

  function setMode(nextMode: ThemeMode) {
    setModeState(nextMode);
  }

  const theme = mode === "dark" ? darkTheme : lightTheme;

  const value = useMemo(
    () => ({
      theme,
      mode,
      isDarkMode: mode === "dark",
      isThemeLoaded,
      toggleTheme,
      setMode,
    }),
    [theme, mode, isThemeLoaded]
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