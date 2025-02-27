import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { db } from '../../config/firebase';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components';

const DetailScreen = ({ route, navigation }) => {
  const { docId } = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ayatCount, setAyatCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, 'data_hafalan', docId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const docData = docSnap.data();
          setData(docData);
          setAyatCount(docData.ayatDihafal);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [docId]);

  const handleIncrement = () => {
    setAyatCount(prev => prev + 1);
  };

  const handleDecrement = () => {
    setAyatCount(prev => Math.max(0, prev - 1));
  };

  const handleUpdate = async () => {
    try {
      const docRef = doc(db, 'data_hafalan', docId);
      await updateDoc(docRef, {
        ayatDihafal: ayatCount,
        setoranTerakhir: serverTimestamp()
      });
      Alert.alert('Sukses', 'Data berhasil diupdate');
      setData(prev => ({ ...prev, ayatDihafal: ayatCount }));
    } catch (error) {
      console.error('Error updating document:', error);
      Alert.alert('Error', 'Gagal mengupdate data');
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Konfirmasi',
      'Apakah Anda yakin ingin menghapus data ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const docRef = doc(db, 'data_hafalan', docId);
              await deleteDoc(docRef);
              Alert.alert('Sukses', 'Data berhasil dihapus', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Gagal menghapus data');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Data tidak ditemukan</Text>
      </View>
    );
  }

  const formatDate = (timestamp) => {
    try {
      if (!timestamp || !timestamp.toDate) return '-';
      const date = timestamp.toDate();
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>Nama:</Text>
        <Text style={styles.value}>{data.nama}</Text>

        <Text style={styles.label}>Jumlah Ayat Dihafal:</Text>
        <View style={styles.counterContainer}>
          <Button
            title="-"
            onPress={handleDecrement}
            style={styles.counterButton}
            textStyle={styles.counterButtonText}
          />
          <Text style={[styles.value, styles.counterValue]}>{ayatCount}</Text>
          <Button
            title="+"
            onPress={handleIncrement}
            style={styles.counterButton}
            textStyle={styles.counterButtonText}
          />
        </View>

        <Text style={styles.label}>Setoran Terakhir:</Text>
        <Text style={styles.value}>{formatDate(data.setoranTerakhir)}</Text>

        <View style={styles.actionButtons}>
          <Button
            title="Update"
            onPress={handleUpdate}
            style={styles.updateButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            style={styles.deleteButton}
            textStyle={styles.deleteButtonText}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  counterButton: {
    width: 40,
    height: 40,
    padding: 0,
    marginHorizontal: 10,
  },
  counterButtonText: {
    fontSize: 20,
  },
  counterValue: {
    marginBottom: 0,
    minWidth: 40,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  updateButton: {
    flex: 1,
    marginRight: 10,
  },
  deleteButton: {
    flex: 1,
    marginLeft: 10,
    backgroundColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FFFFFF',
  },
});

export default DetailScreen;