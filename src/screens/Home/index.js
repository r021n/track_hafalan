import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Button } from "../../components";
import { db } from "../../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  limit,
  startAfter,
  orderBy,
} from "firebase/firestore";

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const performSearch = async (text, isLoadMore = false) => {
    if (!text.trim() && !isLoadMore) {
      setSearchResults([]);
      setLastVisible(null);
      setHasMore(true);
      return;
    }

    try {
      let q;
      if (isLoadMore && lastVisible) {
        q = query(
          collection(db, "data_hafalan"),
          where("nama", ">=", text.toLowerCase()),
          where("nama", "<=", text.toLowerCase() + "\uf8ff"),
          orderBy("nama"),
          startAfter(lastVisible),
          limit(5)
        );
      } else {
        q = query(
          collection(db, "data_hafalan"),
          where("nama", ">=", text.toLowerCase()),
          where("nama", "<=", text.toLowerCase() + "\uf8ff"),
          orderBy("nama"),
          limit(5)
        );
      }

      const querySnapshot = await getDocs(q);
      const results = [];
      querySnapshot.forEach((doc) => {
        results.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      if (!isLoadMore) {
        setSearchResults(results);
      } else {
        setSearchResults((prev) => [...prev, ...results]);
      }

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(results.length === 10);
    } catch (error) {
      console.error("Error searching documents:", error);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text) => {
      setLoading(true);
      performSearch(text).finally(() => setLoading(false));
    }, 800),
    []
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setLoading(true);
      performSearch(searchQuery, true).finally(() => setLoading(false));
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => navigation.navigate("Detail", { docId: item.id })}
    >
      <Text style={styles.resultText}>{item.nama}</Text>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading || !hasMore) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome lur...</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {loading && !hasMore && <ActivityIndicator style={styles.loader} />}
      </View>

      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.resultsList}
        ListEmptyComponent={
          searchQuery.trim() ? (
            <Text style={styles.noResults}>Tidak ada hasil</Text>
          ) : null
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />

      <Button
        title="Tambah Data Hafalan"
        onPress={() => navigation.navigate("Create")}
        style={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  loader: {
    marginLeft: 10,
  },
  resultsList: {
    flex: 1,
    marginBottom: 20,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  resultText: {
    fontSize: 16,
    color: "#333",
  },
  noResults: {
    textAlign: "center",
    color: "#666",
    marginTop: 20,
  },
  button: {
    width: "100%",
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

export default HomeScreen;
