import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TextInputProps,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  isPassword = false,
  ...rest
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const [secureTextEntry, setSecureTextEntry] = useState(isPassword);
  
  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  
  const renderPasswordToggle = () => {
    if (!isPassword) return null;
    
    return (
      <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconContainer}>
        {secureTextEntry ? (
          <EyeOff size={20} color={themeColors.subtext} />
        ) : (
          <Eye size={20} color={themeColors.subtext} />
        )}
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, { color: themeColors.text }, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer, 
        { 
          borderColor: error ? themeColors.error : themeColors.border,
          backgroundColor: theme === 'dark' ? themeColors.card : '#F9FAFB',
        }
      ]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        
        <TextInput
          style={[
            styles.input, 
            { 
              color: themeColors.text,
              flex: 1,
            },
            inputStyle
          ]}
          placeholderTextColor={themeColors.subtext}
          secureTextEntry={secureTextEntry}
          {...rest}
        />
        
        {rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
        {renderPasswordToggle()}
      </View>
      
      {error && (
        <Text style={[styles.error, { color: themeColors.error }, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  input: {
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  iconContainer: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: 4,
    fontSize: 12,
  },
});