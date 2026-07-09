import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { fetchItalianMeals } from "./src/services/mealsApi";


interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}


interface LoggedUser {
  email: string;
  name: string;
}


const SPACING = { sm: 4, md: 8, lg: 16, xl: 24 };


const STORAGE_KEYS = {
  favorites: "@favorite_meals",
  theme: "@theme_mode",
  user: "@logged_user",
};


const lightTheme = {
  background: "#f4f5f7",
  surface: "#ffffff",
  surfaceSoft: "#f8f9fb",
  text: "#1f2937",
  subtext: "#6b7280",
  button: "#1f2937",
  buttonText: "#ffffff",
  error: "#b00020",
  shadow: "#777777",
  border: "#e5e7eb",
  inputBg: "#ffffff",
  overlay: "rgba(0,0,0,0.35)",
  heartActive: "#e63946",
  heartInactive: "#9ca3af",
  badgeBg: "#1f2937",
  badgeText: "#ffffff",
  switchTrackFalse: "#d1d5db",
  switchTrackTrue: "#81b0ff",
  switchThumb: "#ffffff",
  heartBubble: "rgba(255,255,255,0.95)",
  topBar: "#ffffff",
};


const darkTheme = {
  background: "#111827",
  surface: "#1f2937",
  surfaceSoft: "#243041",
  text: "#f9fafb",
  subtext: "#9ca3af",
  button: "#f3f4f6",
  buttonText: "#111827",
  error: "#ff6b6b",
  shadow: "#000000",
  border: "#374151",
  inputBg: "#1f2937",
  overlay: "rgba(0,0,0,0.55)",
  heartActive: "#ff6b6b",
  heartInactive: "#94a3b8",
  badgeBg: "#f3f4f6",
  badgeText: "#111827",
  switchTrackFalse: "#6b7280",
  switchTrackTrue: "#81b0ff",
  switchThumb: "#f9fafb",
  heartBubble: "rgba(31,41,55,0.96)",
  topBar: "#1f2937",
};


const MOCK_USERS = [
  { email: "mario.rossi@student.it", password: "React2026!", name: "Mario Rossi" },
  { email: "giulia.bianchi@student.it", password: "Expo2026!", name: "Giulia Bianchi" },
  { email: "luca.verdi@student.it", password: "Mobile2026!", name: "Luca Verdi" },
];


export default function App() {
  const { width } = useWindowDimensions();
  const isWide = width >= 700;


  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [themeLoaded, setThemeLoaded] = React.useState(false);


  const [favoriteIds, setFavoriteIds] = React.useState<string[]>([]);
  const [favoritesLoaded, setFavoritesLoaded] = React.useState(false);


  const [loggedUser, setLoggedUser] = React.useState<LoggedUser | null>(null);
  const [userLoaded, setUserLoaded] = React.useState(false);


  const [searchText, setSearchText] = React.useState("");


  const [state, setState] = React.useState<{
    status: "idle" | "loading" | "success" | "error";
    items: MealSummary[];
    message: string;
  }>({
    status: "idle",
    items: [],
    message: "",
  });


  const [isLoginOpen, setIsLoginOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loginError, setLoginError] = React.useState("");


  const theme = isDarkMode ? darkTheme : lightTheme;


  const filteredMeals = React.useMemo(() => {
    const query = searchText.trim().toLowerCase();


    if (!query) {
      return state.items;
    }


    return state.items.filter((item) =>
      item.strMeal.toLowerCase().includes(query)
    );
  }, [searchText, state.items]);


  React.useEffect(() => {
    bootstrapApp();
  }, []);


  React.useEffect(() => {
    if (themeLoaded) {
      persistTheme();
    }
  }, [isDarkMode, themeLoaded]);


  React.useEffect(() => {
    if (favoritesLoaded) {
      persistFavorites();
    }
  }, [favoriteIds, favoritesLoaded]);


  React.useEffect(() => {
    if (userLoaded) {
      persistUser();
    }
  }, [loggedUser, userLoaded]);


  async function bootstrapApp() {
    await Promise.all([
      loadMeals(),
      loadTheme(),
      loadFavorites(),
      loadLoggedUser(),
    ]);
  }


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


  async function loadTheme() {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.theme);
      setIsDarkMode(savedTheme === "dark");
    } catch (error) {
      console.log("Errore caricamento tema:", error);
    } finally {
      setThemeLoaded(true);
    }
  }


  async function persistTheme() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.theme,
        isDarkMode ? "dark" : "light"
      );
    } catch (error) {
      console.log("Errore salvataggio tema:", error);
    }
  }


  async function loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.favorites);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavoriteIds(parsed);
        }
      }
    } catch (error) {
      console.log("Errore caricamento preferiti:", error);
    } finally {
      setFavoritesLoaded(true);
    }
  }


  async function persistFavorites() {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.favorites,
        JSON.stringify(favoriteIds)
      );
    } catch (error) {
      console.log("Errore salvataggio preferiti:", error);
    }
  }


  async function loadLoggedUser() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.user);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.email && parsed?.name) {
          setLoggedUser(parsed);
        }
      }
    } catch (error) {
      console.log("Errore caricamento utente:", error);
    } finally {
      setUserLoaded(true);
    }
  }


  async function persistUser() {
    try {
      if (loggedUser) {
        await AsyncStorage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(loggedUser)
        );
      } else {
        await AsyncStorage.removeItem(STORAGE_KEYS.user);
      }
    } catch (error) {
      console.log("Errore salvataggio utente:", error);
    }
  }


  function toggleFavorite(mealId: string) {
    setFavoriteIds((prev) =>
      prev.includes(mealId)
        ? prev.filter((id) => id !== mealId)
        : [...prev, mealId]
    );
  }


  function isFavorite(mealId: string) {
    return favoriteIds.includes(mealId);
  }


  function handleLogin() {
    setLoginError("");


    if (!email.trim() || !password.trim()) {
      setLoginError("Inserisci email e password.");
      return;
    }


    const user = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password
    );


    if (!user) {
      setLoginError("Credenziali non valide.");
      return;
    }


    setLoggedUser({
      email: user.email,
      name: user.name,
    });
    setIsLoginOpen(false);
    setEmail("");
    setPassword("");
    setLoginError("");
  }


  function handleLogout() {
    setLoggedUser(null);
  }


  if (state.status === "loading") {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.centered, { backgroundColor: theme.background }]}>
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
        <SafeAreaView style={[styles.centered, { backgroundColor: theme.background }]}>
          <Text style={[styles.error, { color: theme.error }]}>{state.message}</Text>
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
      <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.topNav,
            {
              backgroundColor: theme.topBar,
              borderBottomColor: theme.border,
              shadowColor: theme.shadow,
            },
          ]}
        >
          <Text style={[styles.appTitle, { color: theme.text }]}>
            My Italian Meal App
          </Text>


          <Pressable
            style={[
              styles.profileButton,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
            onPress={() => setIsLoginOpen(true)}
          >
            <Text style={[styles.profileButtonText, { color: theme.text }]}>
              {loggedUser ? loggedUser.name.charAt(0) : "👤"}
            </Text>
          </Pressable>
        </View>


        <FlatList
          key={isWide ? "wide" : "narrow"}
          data={filteredMeals}
          numColumns={isWide ? 2 : 1}
          keyExtractor={(item) => item.idMeal}
          columnWrapperStyle={isWide ? styles.wideRow : undefined}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          extraData={{ favoriteIds, isDarkMode, loggedUser, searchText }}
          ListHeaderComponent={
            <>
              <View
                style={[
                  styles.heroSection,
                  {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <View style={styles.heroTopRow}>
                  <View style={styles.heroTextBlock}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>
                      Piatti italiani
                    </Text>
                    <Text style={[styles.sectionSubtitle, { color: theme.subtext }]}>
                      Esplora, cerca e salva i tuoi piatti preferiti.
                    </Text>
                  </View>


                  <View style={styles.heroControls}>
                    <View
                      style={[
                        styles.counterBadge,
                        { backgroundColor: theme.badgeBg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.counterBadgeText,
                          { color: theme.badgeText },
                        ]}
                      >
                        ❤ {favoriteIds.length}
                      </Text>
                    </View>


                    <View
                      style={[
                        styles.themeCard,
                        {
                          backgroundColor: theme.surfaceSoft,
                          borderColor: theme.border,
                        },
                      ]}
                    >
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
                </View>


                <TextInput
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholder="Cerca un piatto..."
                  placeholderTextColor={theme.subtext}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={[
                    styles.searchInput,
                    {
                      backgroundColor: theme.inputBg,
                      color: theme.text,
                      borderColor: theme.border,
                    },
                  ]}
                />
              </View>


             
            </>
          }
          renderItem={({ item }) => {
            const favorite = isFavorite(item.idMeal);


            return (
              <View
                style={[
                  styles.card,
                  isWide && styles.cardWide,
                  {
                    backgroundColor: theme.surface,
                    shadowColor: theme.shadow,
                  },
                ]}
              >
                <Pressable
                  style={[
                    styles.heartButton,
                    { backgroundColor: theme.heartBubble },
                  ]}
                  onPress={() => toggleFavorite(item.idMeal)}
                >
                  <Text
                    style={[
                      styles.heartIcon,
                      {
                        color: favorite
                          ? theme.heartActive
                          : theme.heartInactive,
                      },
                    ]}
                  >
                    {favorite ? "♥" : "♡"}
                  </Text>
                </Pressable>


                <Image source={{ uri: item.strMealThumb }} style={styles.thumb} />


                <Text style={[styles.mealName, { color: theme.text }]} numberOfLines={3}>
                  {item.strMeal}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.subtext }]}>
              Nessun piatto trovato.
            </Text>
          }
        />


        <Modal
          visible={isLoginOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsLoginOpen(false)}
        >
          <View style={[styles.modalOverlay, { backgroundColor: theme.overlay }]}>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: theme.surface,
                  shadowColor: theme.shadow,
                },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Login di test
              </Text>


              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                placeholderTextColor={theme.subtext}
                autoCapitalize="none"
                keyboardType="email-address"
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />


              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor={theme.subtext}
                secureTextEntry
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.inputBg,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
              />


              {loginError ? (
                <Text style={[styles.loginError, { color: theme.error }]}>
                  {loginError}
                </Text>
              ) : null}


              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.secondaryButton, { borderColor: theme.border }]}
                  onPress={() => {
                    setIsLoginOpen(false);
                    setLoginError("");
                  }}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                    Chiudi
                  </Text>
                </Pressable>


                <Pressable
                  style={[styles.button, { backgroundColor: theme.button }]}
                  onPress={handleLogin}
                >
                  <Text style={[styles.buttonText, { color: theme.buttonText }]}>
                    Accedi
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
  },
  topNav: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  appTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: "800",
    paddingRight: 12,
  },
  profileButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },
  profileButtonText: {
    fontSize: 18,
    fontWeight: "700",
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: 40,
  },
  heroSection: {
    borderWidth: 1,
    borderRadius: 20,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: SPACING.lg,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroControls: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  counterBadge: {
    minWidth: 72,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  counterBadgeText: {
    fontSize: 14,
    fontWeight: "800",
  },
  themeCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
  },
  loggedBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  loggedTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  loggedText: {
    fontSize: 14,
    marginBottom: 4,
  },
  logoutButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  wideRow: {
    justifyContent: "space-between",
    gap: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  card: {
    flex: 1,
    borderRadius: 18,
    padding: SPACING.md,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
    position: "relative",
    marginBottom: SPACING.lg,
  },
  cardWide: {
    maxWidth: "48.5%",
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 2,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  heartIcon: {
    fontSize: 22,
    fontWeight: "700",
  },
  thumb: {
    width: "100%",
    height: 190,
    borderRadius: 12,
    marginBottom: SPACING.md,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 24,
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
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  mockTitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  mockUserText: {
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginTop: 14,
  },
  loginError: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 18,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
});