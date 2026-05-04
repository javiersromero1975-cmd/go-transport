import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationIndependentTree } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { LoginScreen } from '../../src/screens/auth/LoginScreen';
import { RegisterScreen } from '../../src/screens/auth/RegisterScreen';
import { ChatScreen } from '../../src/screens/chat/ChatScreen';
import { DriverActiveTripScreen, DriverHomeScreen } from '../../src/screens/driver/DriverScreens';
import { AboutScreen, NotificationsScreen, SecurityScreen, SupportScreen } from '../../src/screens/passenger/ExtraScreens';
import { HomeScreen } from '../../src/screens/passenger/HomeScreen';
import { PrivacyScreen, TermsScreen } from '../../src/screens/passenger/LegalScreens';
import { ActiveTripScreen, HistoryScreen, PaymentScreen, ProfileScreen, RateTripScreen, SearchingScreen } from '../../src/screens/passenger/OtherScreens';
import { SearchDestinationScreen } from '../../src/screens/passenger/SearchDestinationScreen';
import { Colors } from '../../src/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const PassengerTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textTertiary, tabBarStyle: { borderTopWidth: 0.5, borderTopColor: Colors.border, height: 60, paddingBottom: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '500' } }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🏠</Text> }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarLabel: 'Historial', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🕐</Text> }} />
    <Tab.Screen name="Payment" component={PaymentScreen} options={{ tabBarLabel: 'Pagos', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>💳</Text> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>👤</Text> }} />
  </Tab.Navigator>
);

const DriverTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textTertiary, tabBarStyle: { borderTopWidth: 0.5, borderTopColor: Colors.border, height: 60, paddingBottom: 8 }, tabBarLabelStyle: { fontSize: 11, fontWeight: '500' } }}>
    <Tab.Screen name="DriverHome" component={DriverHomeScreen} options={{ tabBarLabel: 'Inicio', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>🚗</Text> }} />
    <Tab.Screen name="DriverProfile" component={ProfileScreen} options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ focused }) => <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.4 }}>👤</Text> }} />
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
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
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
    <Stack.Screen name="Chat" component={ChatScreen} />
    <Stack.Screen name="History" component={HistoryScreen} />
    <Stack.Screen name="Payment" component={PaymentScreen} />
    <Stack.Screen name="Security" component={SecurityScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="Terms" component={TermsScreen} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} />
  </Stack.Navigator>
);

function Navigator() {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) {
    return <View style={s.loading}><Text style={s.logo}>GO</Text></View>;
  }
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user?.role === 'driver' ? (
        <Stack.Screen name="DriverNav" component={DriverNavigator} />
      ) : (
        <Stack.Screen name="PassengerNav" component={PassengerNavigator} />
      )}
    </Stack.Navigator>
  );
}

const s = StyleSheet.create({
  loading: { flex: 1, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  logo: { fontSize: 56, fontWeight: '700', color: '#F5C842', letterSpacing: -3 },
});

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationIndependentTree>
          <Navigator />
        </NavigationIndependentTree>
      </AuthProvider>
    </SafeAreaProvider>
  );
}