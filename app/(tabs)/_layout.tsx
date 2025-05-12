import React from 'react';
import { Tabs } from 'expo-router';
import { Home, PieChart, Plus, Settings, FileText } from 'lucide-react-native';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { useRouter } from 'expo-router';

export default function TabLayout() {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const router = useRouter();
  
  const handleAddTransaction = () => {
    router.push('/transaction/new');
  };
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: themeColors.primary,
        tabBarInactiveTintColor: themeColors.subtext,
        tabBarStyle: {
          backgroundColor: themeColors.background,
          borderTopColor: themeColors.border,
        },
        headerStyle: {
          backgroundColor: themeColors.background,
        },
        headerTintColor: themeColors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <FileText size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: themeColors.primary }]}
              onPress={handleAddTransaction}
            >
              <Plus size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default behavior
            e.preventDefault();
            handleAddTransaction();
          },
        }}
      />
      
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => <PieChart size={size} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
});