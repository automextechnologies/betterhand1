import { useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LandingScreen from './src/screens/LandingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonorDashboardScreen from './src/screens/DonorDashboardScreen';
import HospitalDashboardScreen from './src/screens/HospitalDashboardScreen';
import WardMemberDashboardScreen from './src/screens/WardMemberDashboardScreen';
import { useAuthStore } from './src/store/authStore';
import { authApi } from './src/api';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isAuthenticated, isHydrated, user, logout } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (isAuthenticated && !user) {
        try {
          const userData = await authApi.getProfile();
          useAuthStore.setState({ user: userData });
        } catch (error) {
          logout();
        }
      }
    };
    if (isHydrated) fetchUser();
  }, [isAuthenticated, isHydrated, user]);

  if (!isHydrated) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#e11d48" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            {user?.role === 'donor' && <Stack.Screen name="DonorDashboard" component={DonorDashboardScreen} />}
            {user?.role === 'hospital' && <Stack.Screen name="HospitalDashboard" component={HospitalDashboardScreen} />}
            {user?.role === 'ward_member' && <Stack.Screen name="WardMemberDashboard" component={WardMemberDashboardScreen} />}
            
            {/* Fallback if role is missing or loading */}
            {!user && <Stack.Screen name="Loading" component={() => <View style={styles.container}><ActivityIndicator color="#e11d48"/></View>} />}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e11d48',
  },
  subtitle: {
    fontSize: 16,
    color: '#7a6f68',
    marginTop: 8,
  }
});
