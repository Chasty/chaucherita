import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Mail, Lock, User } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface AuthFormProps {
  type: 'login' | 'register';
  onSubmit: (data: { email: string; password: string; name?: string }) => void;
  onToggleForm: () => void;
  isLoading: boolean;
  error?: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type,
  onSubmit,
  onToggleForm,
  isLoading,
  error,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    name: '',
  });
  
  const validate = () => {
    let isValid = true;
    const newErrors = { email: '', password: '', name: '' };
    
    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    // Name validation (only for register)
    if (type === 'register' && !name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        email,
        password,
        ...(type === 'register' && { name }),
      });
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.text }]}>
        {type === 'login' ? 'Welcome Back' : 'Create Account'}
      </Text>
      
      <Text style={[styles.subtitle, { color: themeColors.subtext }]}>
        {type === 'login'
          ? 'Sign in to continue to your account'
          : 'Sign up to start managing your finances'}
      </Text>
      
      {error && (
        <View style={[styles.errorContainer, { backgroundColor: `${themeColors.error}20` }]}>
          <Text style={[styles.errorText, { color: themeColors.error }]}>{error}</Text>
        </View>
      )}
      
      {type === 'register' && (
        <Input
          label="Name"
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
          error={errors.name}
          leftIcon={<User size={20} color={themeColors.subtext} />}
          autoCapitalize="words"
        />
      )}
      
      <Input
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        leftIcon={<Mail size={20} color={themeColors.subtext} />}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <Input
        label="Password"
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        leftIcon={<Lock size={20} color={themeColors.subtext} />}
        isPassword
        secureTextEntry
      />
      
      <Button
        title={type === 'login' ? 'Sign In' : 'Sign Up'}
        onPress={handleSubmit}
        isLoading={isLoading}
        style={styles.button}
      />
      
      <View style={styles.toggleContainer}>
        <Text style={[styles.toggleText, { color: themeColors.subtext }]}>
          {type === 'login' ? "Don't have an account?" : 'Already have an account?'}
        </Text>
        <TouchableOpacity onPress={onToggleForm}>
          <Text style={[styles.toggleButton, { color: themeColors.primary }]}>
            {type === 'login' ? 'Sign Up' : 'Sign In'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 400,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorContainer: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
  },
  button: {
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 14,
    marginRight: 4,
  },
  toggleButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});