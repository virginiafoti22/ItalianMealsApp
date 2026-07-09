export const lightTheme = {
  mode: "light",
  background: "#FFFFFF",
  surface: "#F7F7F7",
  text: "#111111",
  subtext: "#555555",
  border: "#D9D9D9",
  primary: "#E53935",
  buttonText: "#111111",
  error: "#B00020",
  shadow: "#808080",
  overlay: "rgba(0, 0, 0, 0.35)",
  heartActive: "#E53935",
};

export const darkTheme = {
  mode: "dark",
  background: "#121212",
  surface: "#1E1E1E",
  text: "#FFFFFF",
  subtext: "#BBBBBB",
  border: "#3A3A3A",
  primary: "#FF6B6B",
  buttonText: "#FFFFFF",
  error: "#CF6679",
  shadow: "#000000",
  overlay: "rgba(0, 0, 0, 0.55)",
  heartActive: "#FF6B6B",
};

export type AppTheme = typeof lightTheme;