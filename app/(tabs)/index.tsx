import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { ThemeProvider } from '../../src/context/ThemeContext';
import { LoginScreen } from '../../src/screens/auth/LoginScreen';
import { RegisterScreen } from '../../src/screens/auth/RegisterScreen';
import { ChatScreen } from '../../src/screens/chat/ChatScreen';
import { DriverActiveTripScreen, DriverHomeScreen } from '../../src/screens/driver/DriverScreens';
import { VerificationScreen } from '../../src/screens/driver/VerificationScreen';
import { AboutScreen, NotificationsScreen, SecurityScreen, SupportScreen } from '../../src/screens/passenger/ExtraScreens';
import { HomeScreen } from '../../src/screens/passenger/HomeScreen';
import { PrivacyScreen, TermsScreen } from '../../src/screens/passenger/LegalScreens';
import { ActiveTripScreen, HistoryScreen, PaymentScreen, ProfileScreen, RateTripScreen, SearchingScreen } from '../../src/screens/passenger/OtherScreens';
import { SearchDestinationScreen } from '../../src/screens/passenger/SearchDestinationScreen';
import { Colors } from '../../src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PassengerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: Colors.white, borderTopColor: Colors.border }, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textTertiary }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text> }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Viajes', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕐</Text> }} />
    <Tab.Screen name="Payment" component={PaymentScreen} options={{ tabBarLabel: 'Pagos', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>💳</Text> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
  </Tab.Navigator>
);

const DriverTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarStyle: { backgroundColor: Colors.primary, borderTopColor: Colors.border }, tabBarActiveTintColor: Colors.accent, tabBarInactiveTintColor: 'rgba(255,255,255,0.4)' }}>
    <Tab.Screen name="DriverHome" component={DriverHomeScreen} options={{ tabBarLabel: 'Solicitudes', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🚗</Text> }} />
    <Tab.Screen name="DriverHistory" component={HistoryScreen} options={{ tabBarLabel: 'Historial', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🕐</Text> }} />
    <Tab.Screen name="DriverProfile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text> }} />
  </Tab.Navigator>
);

const PassengerNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={PassengerTabs} />
    <Stack.Screen name="SearchDestination" component={SearchDestinationScreen} />
    <Stack.Screen name="Searching" component={SearchingScreen} />
    <Stack.Screen name="ActiveTrip" component={ActiveTripScreen} />
    <Stack.Screen name="RateTrip" component={RateTripScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
  </Stack.Navigator>
);

const DriverNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="DriverTabs" component={DriverTabs} />
    <Stack.Screen name="DriverActiveTrip" component={DriverActiveTripScreen} />
    <Stack.Screen name="Verification" component={VerificationScreen} />
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }
  return user?.role === 'driver' ? <DriverNavigator /> : <PassengerNavigator />;
};

export default function App() {
  return (
    <NavigationIndependentTree>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </ThemeProvider>
    </NavigationIndependentTree>
  );
}