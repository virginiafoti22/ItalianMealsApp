import { Pressable, StyleSheet, Text, View } from "react-native";

const DATA = [
  { id: "a1", title: "Alpha", description: "First item" },
  { id: "b2", title: "Beta", description: "Second item" },
  { id: "c3", title: "Gamma", description: "Third item" },
];

export function DetailsScreen({ navigation, route }: any) {
  const id = route.params?.id;
  if (!id) return <Text style={{ padding: 16 }}>Invalid route param</Text>;

  const item = DATA.find((x) => x.id === id);
  if (!item) return <Text style={{ padding: 16 }}>Product not found</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{item.title}</Text>
      <Text>{item.description}</Text>
      <Pressable style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Go back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "700" },
  button: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  buttonText: { fontWeight: "600" },
});