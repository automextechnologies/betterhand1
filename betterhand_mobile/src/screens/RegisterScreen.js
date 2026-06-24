import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Dimensions, ScrollView } from 'react-native';
import { ArrowLeft, User, Mail, Lock, Building2, Droplet, Landmark } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('donor'); // 'donor', 'hospital', 'ward'

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#1f1b19" />
          </TouchableOpacity>
        </View>

        {/* Title Area */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join the network to start saving lives today.</Text>
        </View>

        {/* Role Selector */}
        <View style={styles.roleSelector}>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'donor' && styles.roleBtnActive]}
            onPress={() => setRole('donor')}
          >
            <Droplet size={18} color={role === 'donor' ? '#fff' : '#7a6f68'} />
            <Text style={[styles.roleText, role === 'donor' && styles.roleTextActive]}>Donor</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'hospital' && styles.roleBtnActiveHospital]}
            onPress={() => setRole('hospital')}
          >
            <Building2 size={18} color={role === 'hospital' ? '#fff' : '#7a6f68'} />
            <Text style={[styles.roleText, role === 'hospital' && styles.roleTextActive]}>Hospital</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleBtn, role === 'ward' && styles.roleBtnActiveWard]}
            onPress={() => setRole('ward')}
          >
            <Landmark size={18} color={role === 'ward' ? '#fff' : '#7a6f68'} />
            <Text style={[styles.roleText, role === 'ward' && styles.roleTextActive]}>Ward</Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <User size={20} color="#9b918a" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor="#c0b9b2"
                value={name}
                onChangeText={setName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#9b918a" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor="#c0b9b2"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#9b918a" style={styles.inputIcon} />
              <TextInput 
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor="#c0b9b2"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.primaryBtn} activeOpacity={0.8}>
            <Text style={styles.primaryBtnText}>Register Account</Text>
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf8ff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  titleArea: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1f1b19',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#5f554f',
    lineHeight: 24,
  },
  roleSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 6,
    borderRadius: 20,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  roleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  roleBtnActive: {
    backgroundColor: '#e11d48', // Donor
  },
  roleBtnActiveHospital: {
    backgroundColor: '#2563eb', // Hospital
  },
  roleBtnActiveWard: {
    backgroundColor: '#059669', // Ward
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7a6f68',
  },
  roleTextActive: {
    color: '#fff',
  },
  formCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 30,
    elevation: 8,
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4a423d',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f7f6',
    borderWidth: 1,
    borderColor: '#efedeb',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1f1b19',
    height: '100%',
  },
  primaryBtn: {
    backgroundColor: '#1f1b19',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 16,
    marginTop: 12,
    shadowColor: '#1f1b19',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  footerText: {
    fontSize: 15,
    color: '#7a6f68',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e11d48',
  }
});
