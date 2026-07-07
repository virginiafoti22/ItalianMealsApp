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
import { fetchItalianMeals } from "../services/mealsApi";
import { useFavorites } from "../context/FavoritesContext";
import { useAppTheme } from "../context/ThemeContext";


export function HomeScreen({ navigation }: any) {
  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    items: MealSummary[];
    message: string;
  }>({
    status: "idle",
    items: [],
    message: "",
  });

  const { favoriteIds, isLoading, isFavorite, toggleFavorite } = useFavorites();

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

  if (isLoading || state.status === "loading") {
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
        <Text style={styles.subtitle}>Preferiti ({favoriteIds.length})</Text>

        <FlatList
          data={state.items}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={{ gap: 4 }}
          renderItem={({ item }) => {
            const active = isFavorite(item.idMeal);

            return (
              <View style={styles.row}>
                <Pressable
                  style={styles.rowContent}
                  onPress={() =>
                    navigation.navigate("MealDetail", { idMeal: item.idMeal })
                  }
                >
                  <Image
                    source={{ uri: item.strMealThumb }}
                    style={styles.thumb}
                  />
                  <Text style={styles.mealName} numberOfLines={2}>
                    {item.strMeal}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.favButton}
                  onPress={() => toggleFavorite(item.idMeal)}
                >
                  <Text style={[styles.favText, active && styles.favTextActive]}>
                    {active ? "♥" : "♡"}
                  </Text>
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
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: { width: 48, height: 48, borderRadius: 8 },
  mealName: { flex: 1, fontWeight: "600" },
  favButton: { padding: 8, borderWidth: 1, borderRadius: 8 },
  favText: { fontSize: 18, color: "#222" },
  favTextActive: { color: "#E53935" },
});