import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type FavoritesContextValue = {
  favoriteIds: string[];
  favoritesCount: number;
  isFavoritesLoaded: boolean;
  toggleFavorite: (mealId: string) => void;
  isFavorite: (mealId: string) => boolean;
  clearFavorites: () => void;
};

const FAVORITES_STORAGE_KEY = "@favorite_meals";

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined
);

export function FavoritesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isFavoritesLoaded, setIsFavoritesLoaded] = useState(false);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    if (!isFavoritesLoaded) {
      return;
    }

    persistFavorites(favoriteIds);
  }, [favoriteIds, isFavoritesLoaded]);

  async function loadFavorites() {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);

      if (!stored) {
        setFavoriteIds([]);
        return;
      }

      const parsed = JSON.parse(stored);

      if (Array.isArray(parsed)) {
        setFavoriteIds(parsed);
      } else {
        setFavoriteIds([]);
      }
    } catch (error) {
      console.log("Errore caricamento preferiti:", error);
      setFavoriteIds([]);
    } finally {
      setIsFavoritesLoaded(true);
    }
  }

  async function persistFavorites(nextFavoriteIds: string[]) {
    try {
      await AsyncStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(nextFavoriteIds)
      );
    } catch (error) {
      console.log("Errore salvataggio preferiti:", error);
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

  function clearFavorites() {
    setFavoriteIds([]);
  }

  const value = useMemo(
    () => ({
      favoriteIds,
      favoritesCount: favoriteIds.length,
      isFavoritesLoaded,
      toggleFavorite,
      isFavorite,
      clearFavorites,
    }),
    [favoriteIds, isFavoritesLoaded]
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);

  if (!context) {
    throw new Error("useFavorites deve essere usato dentro FavoritesProvider");
  }

  return context;
}