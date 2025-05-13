import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, Platform } from "react-native";
import { useRouter } from "expo-router";
import { AuthForm } from "@/components/auth/AuthForm";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError, isAuthenticated } =
    useAuthStore();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  const handleLogin = async (data: { email: string; password: string }) => {
    await login(data.email, data.password);
  };

  const handleToggleForm = () => {
    clearError();
    router.replace("/(auth)/register");
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View
            style={[
              styles.logoBackground,
              { backgroundColor: `${themeColors.primary}20` },
            ]}
          >
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1580048915913-4f8f5cb481c4?q=80&w=200&auto=format&fit=crop",
              }}
              style={styles.logo}
            />
          </View>
        </View>

        <AuthForm
          type="login"
          onSubmit={handleLogin}
          onToggleForm={handleToggleForm}
          isLoading={isLoading}
          error={error}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  logoContainer: {
    marginBottom: 40,
    alignItems: "center",
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
});
