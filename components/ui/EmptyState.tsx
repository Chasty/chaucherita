import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FileX } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${themeColors.secondary}20` }]}>
        {icon || <FileX size={40} color={themeColors.secondary} />}
      </View>
      
      <Text style={[styles.title, { color: themeColors.text }]}>
        {title}
      </Text>
      
      <Text style={[styles.description, { color: themeColors.subtext }]}>
        {description}
      </Text>
      
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 150,
  },
});