export const lightTheme = {
  mode: "light",
  colors: {
    background: "#FFFFFF",
    card: "#F7F7F7",
    text: "#111111",
    subtext: "#555555",
    border: "#D9D9D9",
    primary: "#E53935",
    buttonText: "#111111",
    error: "#B00020",
  },
};

export const darkTheme = {
  mode: "dark",
  colors: {
    background: "#121212",
    card: "#1E1E1E",
    text: "#FFFFFF",
    subtext: "#BBBBBB",
    border: "#3A3A3A",
    primary: "#FF6B6B",
    buttonText: "#FFFFFF",
    error: "#CF6679",
  },
};

export type AppTheme = typeof lightTheme;