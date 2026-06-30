import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

const DATA = [
  { id: "a1", title: "Alpha" },
  { id: "b2", title: "Beta" },
  { id: "c3", title: "Gamma" },
];

export function HomeScreen({ navigation }: any) {
  return (
    <View style={styles.container}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.listItem}
            onPress={() => navigation.navigate("Details", { id: item.id })}
          >
            <Text>{item.title}</Text>
          </Pressable>
        )}
      />
      <Text style={styles.hint}>Expo Go test: exp://10.0.2.2:8081/--/details/a1</Text>
      <Text style={styles.hint}>Dev build: myapp://details/:id</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  listItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  hint: { marginTop: 12, color: "#666", fontSize: 13 },
});