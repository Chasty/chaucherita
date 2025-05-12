import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 1,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: themeColors.card,
          borderColor: themeColors.border,
          shadowOpacity: theme === 'dark' ? 0.1 : 0.1 * elevation,
          elevation: theme === 'dark' ? elevation / 2 : elevation,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
});