// Color palette for the app
export const colors = {
  light: {
    background: '#FFFFFF',
    card: '#F8F9FA',
    text: '#1A1A1A',
    subtext: '#6B7280',
    primary: '#4F9D69', // Soft green
    secondary: '#5B8DB8', // Muted blue
    accent: '#F9A826',
    border: '#E5E7EB',
    income: '#4F9D69',
    expense: '#E57373',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    background: '#121212',
    card: '#1E1E1E',
    text: '#F3F4F6',
    subtext: '#9CA3AF',
    primary: '#6ABF81', // Lighter soft green for dark mode
    secondary: '#7EAED3', // Lighter muted blue for dark mode
    accent: '#FFBB4D',
    border: '#2D2D2D',
    income: '#6ABF81',
    expense: '#EF9A9A',
    error: '#F87171',
    success: '#34D399',
  }
};

export type ThemeType = 'light' | 'dark';