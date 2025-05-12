import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react-native';
import { Card } from './Card';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { formatCurrency } from '@/utils/date';

interface SummaryCardProps {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  totalIncome,
  totalExpense,
  netBalance,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  return (
    <Card style={styles.container}>
      <View style={styles.balanceContainer}>
        <Text style={[styles.balanceLabel, { color: themeColors.subtext }]}>
          Current Balance
        </Text>
        <Text style={[styles.balanceAmount, { color: themeColors.text }]}>
          {formatCurrency(netBalance)}
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${themeColors.income}20` }]}>
            <ArrowUpRight size={20} color={themeColors.income} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: themeColors.subtext }]}>Income</Text>
            <Text style={[styles.statAmount, { color: themeColors.income }]}>
              {formatCurrency(totalIncome)}
            </Text>
          </View>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.iconContainer, { backgroundColor: `${themeColors.expense}20` }]}>
            <ArrowDownLeft size={20} color={themeColors.expense} />
          </View>
          <View>
            <Text style={[styles.statLabel, { color: themeColors.subtext }]}>Expenses</Text>
            <Text style={[styles.statAmount, { color: themeColors.expense }]}>
              {formatCurrency(totalExpense)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  balanceContainer: {
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
});