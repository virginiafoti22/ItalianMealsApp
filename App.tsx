import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fetchItalianMeals } from "./services/mealsApi";
import { loadFavoriteIds, saveFavoriteIds } from "./services/storage";

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export default function App() {
  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    items: MealSummary[];
    message: string;
  }>({
    status: "idle",
    items: [],
    message: "",
  });
  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = React.useState(false);

  React.useEffect(() => {
    loadFavoriteIds()
      .then(setFavoriteIds)
      .finally(() => setFavoritesLoaded(true));
  }, []);

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

  function toggleFavorite(idMeal: string) {
    setFavoriteIds((current) => {
      const next = current.includes(idMeal)
        ? current.filter((id) => id !== idMeal)
        : [...current, idMeal];
      void saveFavoriteIds(next);
      return next;
    });
  }

  if (!favoritesLoaded || state.status === "loading") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator />
          <Text>Caricamento...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (state.status === "error") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <Text style={styles.error}>{state.message}</Text>
          <Pressable style={styles.button} onPress={loadMeals}>
            <Text style={styles.buttonText}>Retry</Text>
          </Pressable>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Piatti italiani</Text>
        <Text style={styles.subtitle}>
          Preferiti salvati: {favoriteIds.length} (chiave app:v1:favs)
        </Text>
        <FlatList
          data={state.items}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={{ gap: 4 }}
          renderItem={({ item }) => {
            const active = favoriteIds.includes(item.idMeal);
            return (
              <View style={styles.row}>
                <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
                <Text style={styles.mealName} numberOfLines={2}>
                  {item.strMeal}
                </Text>
                <Pressable
                  style={styles.favButton}
                  onPress={() => toggleFavorite(item.idMeal)}
                >
                  <Text style={styles.favText}>{active ? "♥" : "♡"}</Text>
                </Pressable>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  centered: { flex: 1, padding: 16, gap: 8, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#555" },
  error: { color: "#B00020" },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  buttonText: { fontWeight: "600" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  mealName: { flex: 1, fontWeight: "600" },
  favButton: { padding: 8, borderWidth: 1, borderRadius: 8 },
  favText: { fontSize: 18 },
});