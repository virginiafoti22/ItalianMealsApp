/*import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as Linking from "expo-linking";
import { HomeScreen } from "./src/screens/HomeScreen";
import { DetailsScreen } from "./src/screens/DetailsScreen";

const Stack = createNativeStackNavigator();

const linking = {
  prefixes: [Linking.createURL("/"), "myapp://"],
  config: {
    screens: {
      Home: "home",
      Details: "details/:id",
    },
  },
};

export default function App() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Items" }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}*/

import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fetchItalianMeals } from "./src/services/mealsApi";

interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

const SPACING = { sm: 4, md: 8, lg: 16 };

export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 300;
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
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator />
          <Text>Caricamento piatti italiani...</Text>
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
        <Text style={styles.subtitle}>Colonne: {isWide ? 2 : 1}</Text>
        <FlatList
          key={isWide ? "wide" : "narrow"}
          data={state.items}
          numColumns={isWide ? 2 : 1}
          keyExtractor={(item) => item.idMeal}
          columnWrapperStyle={isWide ? styles.wideRow : undefined}
          contentContainerStyle={{ gap: SPACING.sm }}
          renderItem={({ item }) => (
            <View style={[styles.card, isWide && styles.cardWide]}>
              <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />
              <Text style={styles.mealName} numberOfLines={3}>
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
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  centered: { flex: 1, padding: SPACING.lg, gap: SPACING.sm, justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#555" },
  error: { color: "#B00020" },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: SPACING.lg,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#ffffff",
  },
  buttonText: { fontWeight: "600" },
  wideRow: { gap: SPACING.md },
  card: {
    padding: SPACING.md,
    borderWidth: 1,
    borderRadius: 8,
    gap: SPACING.sm,
  },
  cardWide: { flex: 1 },
  thumb: { width: "100%", height: 120, borderRadius: 8 },
  mealName: { fontWeight: "600" },
});