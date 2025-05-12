import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/auth-store';

export default function IndexPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  useEffect(() => {
    // Check authentication status and redirect accordingly
    if (isAuthenticated) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(auth)/login');
    }
  }, [isAuthenticated, router]);
  
  return <View style={styles.container} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});