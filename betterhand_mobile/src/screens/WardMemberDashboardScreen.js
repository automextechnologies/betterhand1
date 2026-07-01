import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, Users, FileText, CheckCircle } from 'lucide-react-native';

export default function WardMemberDashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ward Member Portal</Text>
        <TouchableOpacity onPress={() => navigation.replace('Landing')} style={styles.logoutBtn}>
          <LogOut color="#e11d48" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>Welcome, Member!</Text>
          <Text style={styles.subtitleText}>Manage community requests and verify donors.</Text>
        </View>

        {/* Action Cards */}
        <View style={styles.grid}>
          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#fee2e2' }]}>
              <Users color="#e11d48" size={32} />
            </View>
            <Text style={styles.cardTitle}>Local Donors</Text>
            <Text style={styles.cardDesc}>View registered donors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#e0e7ff' }]}>
              <FileText color="#4f46e5" size={32} />
            </View>
            <Text style={styles.cardTitle}>Blood Requests</Text>
            <Text style={styles.cardDesc}>Review local needs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: '#dcfce7' }]}>
              <CheckCircle color="#16a34a" size={32} />
            </View>
            <Text style={styles.cardTitle}>Verifications</Text>
            <Text style={styles.cardDesc}>Verify donor identities</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0e6e6',
    elevation: 2, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  logoutBtn: {
    padding: 5,
  },
  scrollContent: {
    padding: 20,
  },
  welcomeSection: {
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
  },
  grid: {
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'flex-start',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  iconWrapper: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  cardDesc: {
    fontSize: 14,
    color: '#6b7280',
  }
});
