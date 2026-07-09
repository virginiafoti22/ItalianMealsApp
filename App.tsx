import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";
import { fetchItalianMeals } from "./src/services/mealsApi";

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

const SPACING = {
  sm: 4,
  md: 8,
  lg: 16,
};

const lightTheme = {
  background: "#f5f5f5",
  card: "#ffffff",
  text: "#222222",
  subtext: "#666666",
  button: "#222222",
  buttonText: "#ffffff",
  error: "#b00020",
  shadow: "#777777",
  switchTrackFalse: "#c7c7c7",
  switchTrackTrue: "#81b0ff",
  switchThumb: "#ffffff",
};

const darkTheme = {
  background: "#121212",
  card: "#1e1e1e",
  text: "#f3f3f3",
  subtext: "#b0b0b0",
  button: "#f3f3f3",
  buttonText: "#121212",
  error: "#ff6b6b",
  shadow: "#000000",
  switchTrackFalse: "#767577",
  switchTrackTrue: "#81b0ff",
  switchThumb: "#f4f3f4",
};

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    items: MealSummary[];
    message: string;
  }>({
    status: "idle",
    items: [],
    message: "",
  });

  async function loadMeals() {
    setState({ status: "loading", items: [], message: "" });

    try {
      const data = await fetchItalianMeals();
      setState({ status: "success", items: data, message: "" });
    } catch {
      setState({
        status: "error",
        items: [],
        message: "Caricamento fallito. Controlla la connessione.",
      });
    }
  }

  React.useEffect(() => {
    loadMeals();
  }, []);

  if (state.status === "loading") {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.centered, { backgroundColor: theme.background }]}
        >
          <ActivityIndicator size="large" color={theme.subtext} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Caricamento piatti italiani...
          </Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (state.status === "error") {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.container, { backgroundColor: theme.background }]}
        >
          <View style={styles.themeRow}>
            <Text style={[styles.themeLabel, { color: theme.text }]}>
              Tema scuro
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{
                false: theme.switchTrackFalse,
                true: theme.switchTrackTrue,
              }}
              thumbColor={theme.switchThumb}
            />
          </View>

          <Text style={[styles.error, { color: theme.error }]}>
            {state.message}
          </Text>

          <Pressable
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={loadMeals}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              Riprova
            </Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Piatti italiani
            </Text>
            <Text style={[styles.subtitle, { color: theme.subtext }]}>
              Colonne: {isWide ? 2 : 1}
            </Text>
          </View>

          <View style={styles.themeSwitchBox}>
            <Text style={[styles.themeLabel, { color: theme.text }]}>
              Dark
            </Text>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{
                false: theme.switchTrackFalse,
                true: theme.switchTrackTrue,
              }}
              thumbColor={theme.switchThumb}
            />
          </View>
        </View>

        <FlatList
          key={isWide ? "wide" : "narrow"}
          data={state.items}
          numColumns={isWide ? 2 : 1}
          keyExtractor={(item) => item.idMeal}
          columnWrapperStyle={isWide ? styles.wideRow : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                isWide && styles.cardWide,
                {
                  backgroundColor: theme.card,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
              <Text
                style={[styles.mealName, { color: theme.text }]}
                numberOfLines={3}
              >
                {item.strMeal}
              </Text>
            </View>
          )}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },

  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  themeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },

  themeSwitchBox: {
    alignItems: "center",
    gap: 6,
  },

  themeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },

  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: SPACING.sm,
  },

  subtitle: {
    fontSize: 14,
  },

  listContent: {
    paddingBottom: SPACING.lg,
    gap: SPACING.lg,
  },

  wideRow: {
    justifyContent: "space-between",
    gap: SPACING.lg,
  },

  card: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 0,
    padding: SPACING.md,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

  cardWide: {
    maxWidth: "48%",
  },

  thumb: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: SPACING.md,
  },

  mealName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },

  error: {
    fontSize: 16,
    marginBottom: SPACING.lg,
  },

  button: {
    alignSelf: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },

  buttonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});