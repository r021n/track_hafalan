import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import { Button } from "../../components";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CreateScreen = ({ navigation }) => {
  const [nama, setNama] = useState("");
  const [ayat, setAyat] = useState("");

  const handleCreate = async () => {
    if (!nama.trim() || !ayat.trim()) {
      Alert.alert("Error", "Semua field harus diisi");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "data_hafalan"), {
        nama: nama.toLowerCase(),
        ayatDihafal: Number(ayat),
        setoranTerakhir: serverTimestamp(),
      });

      Alert.alert("Sukses", "Data berhasil disimpan", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan data");
      console.error("Error adding document: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tambah Data Hafalan</Text>

      <View style={styles.form}>
        <Text style={styles.label}>Nama</Text>
        <TextInput
          style={styles.input}
          value={nama}
          onChangeText={setNama}
          placeholder="Masukkan nama"
        />

        <Text style={styles.label}>Jumlah Ayat</Text>
        <TextInput
          style={styles.input}
          value={ayat}
          onChangeText={setAyat}
          placeholder="Masukkan jumlah ayat"
          keyboardType="numeric"
        />

        <Button title="Create" onPress={handleCreate} style={styles.button} />
      </View>
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
  form: {
    width: "100%",
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    marginTop: 10,
  },
});

export default CreateScreen;
