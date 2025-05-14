import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useMemo } from "react";
import { InteractionManager, Platform, useColorScheme } from "react-native";
import { StatusBar } from "expo-status-bar";
import { useThemeStore } from "@/stores/theme-store";
import { colors } from "@/constants/colors";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

import { ErrorBoundary } from "./error-boundary";
import { useExpoUpdateStatus } from "@/hooks/useExpoUpdate";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });

  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const expoUpdateState = useExpoUpdateStatus();

  const isHydrated = useMemo(() => {
    if (!expoUpdateState.hydrated || expoUpdateState.isPending) {
      return false;
    }
    return loaded;
  }, [expoUpdateState, loaded]);

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (isHydrated) {
      const interaction = InteractionManager.runAfterInteractions(() => {
        SplashScreen.hide();
      });
      return () => {
        interaction.cancel();
      };
    }
  }, [isHydrated]);

  if (!isHydrated) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ErrorBoundary>
          <StatusBar style={theme === "dark" ? "light" : "dark"} />
          <RootLayoutNav />
        </ErrorBoundary>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

function RootLayoutNav() {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: themeColors.background,
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/register" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="transaction/[id]"
        options={{
          title: "Transaction Details",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="transaction/new"
        options={{
          title: "New Transaction",
          //presentation: "modal",
        }}
      />
      <Stack.Screen
        name="transaction/edit/[id]"
        options={{
          title: "Edit Transaction",
          //presentation: "modal",
        }}
      />
    </Stack>
  );
}
