import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fetchItalianMeals, fetchMealById } from "../services/mealsApi";
import { useFavorites } from "../context/FavoritesContext";
import { useAppTheme } from "../context/ThemeContext";

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

interface MealDetails {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  ingredients: { ingredient: string; measure?: string }[];
}

export function HomeScreen({ navigation }: any) {
  const { theme } = useAppTheme();
  const { favoriteIds, isFavoritesLoaded, isFavorite, toggleFavorite } = useFavorites();

  const [selectedMeal, setSelectedMeal] = React.useState<MealDetails | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = React.useState(false);
  const [isDetailsLoading, setIsDetailsLoading] = React.useState(false);
  const [detailsError, setDetailsError] = React.useState("");

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

  async function handleOpenMealDetails(mealId: string) {
    try {
      setDetailsError("");
      setSelectedMeal(null);
      setIsDetailsLoading(true);
      setIsDetailsOpen(true);

      const mealDetails = await fetchMealDetailsById(mealId);
      setSelectedMeal(mealDetails);
    } catch {
      setDetailsError("Impossibile caricare i dettagli della ricetta.");
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function handleCloseMealDetails() {
    setIsDetailsOpen(false);
    setSelectedMeal(null);
    setDetailsError("");
  }

  React.useEffect(() => {
    loadMeals();
  }, []);

  if (!isFavoritesLoaded || state.status === "loading") {
    return (
      <SafeAreaProvider>
        <SafeAreaView
          style={[styles.centered, { backgroundColor: theme.background }]}
        >
          <ActivityIndicator size="large" color={theme.subtext} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            Caricamento...
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
          <Text style={[styles.error, { color: theme.error }]}>
            {state.message}
          </Text>

          <Pressable
            style={[
              styles.button,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            onPress={loadMeals}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              Retry
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
        <Text style={[styles.title, { color: theme.text }]}>
          Piatti italiani
        </Text>

        <Text style={[styles.subtitle, { color: theme.subtext }]}>
          Preferiti ({favoriteIds.length})
        </Text>

        <FlatList
          data={state.items}
          keyExtractor={(item) => item.idMeal}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={favoriteIds}
          renderItem={({ item }) => {
            const active = isFavorite(item.idMeal);

            return (
              <View
                style={[
                  styles.row,
                  {
                    backgroundColor: theme.surface,
                    borderBottomColor: theme.border,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <Pressable
                  style={styles.rowContent}
                  onPress={() => handleOpenMealDetails(item.idMeal)}
                >
                  <Image
                    source={{ uri: item.strMealThumb }}
                    style={styles.thumb}
                  />

                  <Text
                    style={[styles.mealName, { color: theme.text }]}
                    numberOfLines={2}
                  >
                    {item.strMeal}
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.favButton,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.surface,
                    },
                  ]}
                  onPress={() => toggleFavorite(item.idMeal)}
                >
                  <Text
                    style={[
                      styles.favText,
                      { color: theme.text },
                      active && { color: theme.heartActive },
                    ]}
                  >
                    {active ? "♥" : "♡"}
                  </Text>
                </Pressable>
              </View>
            );
          }}
        />

        <Modal
          visible={isDetailsOpen}
          transparent
          animationType="slide"
          onRequestClose={handleCloseMealDetails}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View
              style={[
                styles.detailsModalCard,
                {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <Pressable
                onPress={handleCloseMealDetails}
                style={styles.detailsCloseButton}
              >
                <Text style={[styles.detailsCloseText, { color: theme.text }]}>
                  Chiudi
                </Text>
              </Pressable>

              {isDetailsLoading ? (
                <ActivityIndicator size="large" color={theme.subtext} />
              ) : detailsError ? (
                <Text style={[styles.error, { color: theme.error }]}>
                  {detailsError}
                </Text>
              ) : selectedMeal ? (
                <FlatList
                  data={selectedMeal.ingredients}
                  keyExtractor={(_, index) => `${selectedMeal.idMeal}-${index}`}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <Text style={[styles.ingredientItem, { color: theme.text }]}>
                      • {item.ingredient}
                      {item.measure ? ` - ${item.measure}` : ""}
                    </Text>
                  )}
                  ListHeaderComponent={
                    <View>
                      <Image
                        source={{ uri: selectedMeal.strMealThumb }}
                        style={styles.detailsImage}
                      />
                      <Text style={[styles.detailsTitle, { color: theme.text }]}>
                        {selectedMeal.strMeal}
                      </Text>
                      <Text style={[styles.detailsMeta, { color: theme.subtext }]}>
                        {selectedMeal.strCategory} • {selectedMeal.strArea}
                      </Text>
                      <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>
                        Ingredienti
                      </Text>
                    </View>
                  }
                  ListFooterComponent={
                    <View style={styles.instructionsBlock}>
                      <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>
                        Preparazione
                      </Text>
                      <Text style={[styles.instructionsText, { color: theme.subtext }]}>
                        {selectedMeal.strInstructions}
                      </Text>
                    </View>
                  }
                />
              ) : null}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    padding: 16,
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
  },
  listContent: {
    gap: 8,
    paddingBottom: 16,
  },
  error: {
    fontSize: 15,
  },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  rowContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  mealName: {
    flex: 1,
    fontWeight: "600",
    fontSize: 15,
  },
  favButton: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 10,
  },
  favText: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  detailsModalCard: {
    maxHeight: "88%",
    borderRadius: 20,
    padding: 18,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  detailsCloseButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  detailsCloseText: {
    fontSize: 15,
    fontWeight: "700",
  },
  detailsImage: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 14,
  },
  detailsTitle: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 6,
  },
  detailsMeta: {
    fontSize: 14,
    marginBottom: 16,
  },
  detailsSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  ingredientItem: {
    fontSize: 15,
    marginBottom: 6,
    lineHeight: 22,
  },
  instructionsBlock: {
    marginTop: 18,
    paddingBottom: 12,
  },
  instructionsText: {
    fontSize: 15,
    lineHeight: 24,
  },
});

async function fetchMealDetailsById(mealId: string): Promise<MealDetails> {
  const meal = await fetchMealById(mealId);

  if (!meal) {
    throw new Error("Meal not found");
  }

  const ingredients: { ingredient: string; measure?: string }[] = [];

  for (let index = 1; index <= 20; index += 1) {
    const ingredient = (meal as any)[`strIngredient${index}`]?.trim();
    const measure = (meal as any)[`strMeasure${index}`]?.trim();

    if (ingredient) {
      ingredients.push({
        ingredient,
        measure: measure || undefined,
      });
    }
  }

  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strCategory: meal.strCategory,
    strArea: meal.strArea,
    strInstructions: meal.strInstructions,
    ingredients,
  };
}