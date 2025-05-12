import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps
} from 'react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  leftIcon,
  rightIcon,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      opacity: disabled ? 0.6 : 1,
    };
    
    // Size variations
    switch (size) {
      case 'small':
        baseStyle.paddingVertical = 6;
        baseStyle.paddingHorizontal = 12;
        break;
      case 'large':
        baseStyle.paddingVertical = 16;
        baseStyle.paddingHorizontal = 24;
        break;
      default: // medium
        baseStyle.paddingVertical = 12;
        baseStyle.paddingHorizontal = 16;
    }
    
    // Variant styles
    switch (variant) {
      case 'secondary':
        baseStyle.backgroundColor = themeColors.secondary;
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = themeColors.primary;
        break;
      case 'danger':
        baseStyle.backgroundColor = themeColors.error;
        break;
      default: // primary
        baseStyle.backgroundColor = themeColors.primary;
    }
    
    return baseStyle;
  };
  
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      color: variant === 'outline' ? themeColors.primary : themeColors.text,
    };
    
    // Size variations
    switch (size) {
      case 'small':
        baseStyle.fontSize = 14;
        break;
      case 'large':
        baseStyle.fontSize = 18;
        break;
      default: // medium
        baseStyle.fontSize = 16;
    }
    
    return baseStyle;
  };
  
  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? themeColors.primary : '#fff'} />
      ) : (
        <>
          {leftIcon && <>{leftIcon}</>}
          <Text style={[getTextStyle(), textStyle]}>{title}</Text>
          {rightIcon && <>{rightIcon}</>}
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
});