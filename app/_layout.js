// Root Layout - Logo App by AurumFX Pvt Ltd
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { AppLocationProvider } from '../context/AppLocationContext';
import { AuthProvider } from '../context/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <AppLocationProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#F8F9FE' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="sign-in" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="sign-up" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="edit-profile" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="profile-details" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="profile-address" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="privacy-policy" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="contact-us" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen name="about" options={{ headerShown: false, animation: 'slide_from_right' }} />
        <Stack.Screen
          name="policy/[key]"
          options={{ headerShown: false, animation: 'slide_from_bottom', presentation: 'modal' }}
        />
        <Stack.Screen
          name="business/[id]"
          options={{
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="category/[slug]"
          options={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack>
      </AppLocationProvider>
    </AuthProvider>
  );
}
