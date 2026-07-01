import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Dimensions, ScrollView, Platform } from 'react-native';
import { Droplets, Heart, ArrowRight, Activity, Zap } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Text style={styles.logoText}>BetterHand<Text style={styles.logoDot}>.</Text></Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.navLink}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Content */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Heart size={14} color="#e11d48" />
            <Text style={styles.badgeText}>Live Blood Donation Network</Text>
          </View>

          <Text style={styles.title}>Every Second</Text>
          <Text style={styles.titleHighlight}>Saves A Life</Text>

          <Text style={styles.subtitle}>
            BetterHand connects hospitals with eligible blood donors instantly.
            GPS matching, live tracking, and real-time chat.
          </Text>

          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={styles.primaryBtn} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Register')}
            >
              <Droplets size={20} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.primaryBtnText}>Join as Donor</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.secondaryBtn} 
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.secondaryBtnText}>Register Hospital</Text>
              <ArrowRight size={18} color="#4a423d" style={{marginLeft: 8}} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, {backgroundColor: '#fff1f2'}]}>
                <Activity size={22} color="#f43f5e" />
              </View>
              <View>
                <Text style={styles.statVal}>98%</Text>
                <Text style={styles.statLabel}>Match Rate</Text>
              </View>
            </View>
            <View style={styles.statItem}>
              <View style={[styles.statIconWrap, {backgroundColor: '#fffbeb'}]}>
                <Zap size={22} color="#f59e0b" />
              </View>
              <View>
                <Text style={styles.statVal}>&lt;12m</Text>
                <Text style={styles.statLabel}>Avg Response</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 3D Image Display */}
        <View style={styles.imageContainer}>
          <View style={styles.imageGlassWrapper}>
            <Image 
              source={require('../../assets/hero-3d.png')} 
              style={styles.heroImage} 
              resizeMode="cover"
            />
          </View>
          
          {/* Floating UI Match Card */}
          <View style={styles.floatingCard}>
             <View style={styles.floatingIcon}>
               <Droplets size={16} color="#10b981" />
             </View>
             <View>
               <Text style={styles.floatingCardTitle}>Live Match</Text>
               <Text style={styles.floatingCardDesc}>O- Negative Donor Found</Text>
             </View>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 60,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1f1b19',
    letterSpacing: -0.5,
  },
  logoDot: {
    color: '#e11d48',
  },
  navLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#5f554f',
  },
  heroSection: {
    paddingHorizontal: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: '#fecdd3',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 30,
    marginBottom: 24,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#e11d48',
    marginLeft: 6,
  },
  title: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1f1b19',
    letterSpacing: -1,
    lineHeight: 52,
  },
  titleHighlight: {
    fontSize: 48,
    fontWeight: '900',
    color: '#e11d48',
    letterSpacing: -1,
    lineHeight: 52,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f554f',
    lineHeight: 24,
    marginBottom: 32,
    paddingRight: 20,
  },
  actionContainer: {
    marginBottom: 40,
  },
  primaryBtn: {
    backgroundColor: '#e11d48',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#e11d48',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ddd9d5',
  },
  secondaryBtnText: {
    color: '#4a423d',
    fontSize: 16,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1f1b19',
  },
  statLabel: {
    fontSize: 12,
    color: '#7a6f68',
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  imageGlassWrapper: {
    width: width - 40,
    height: width - 40,
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 40,
    elevation: 10,
    transform: [{ rotate: '2deg' }],
  },
  heroImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  floatingCard: {
    position: 'absolute',
    bottom: -20,
    left: 10,
    backgroundColor: 'rgba(255,255,255,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 15,
  },
  floatingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  floatingCardTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#9b918a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  floatingCardDesc: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1f1b19',
  }
});
