import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ArrowDownLeft, ArrowUpRight, MoreVertical } from 'lucide-react-native';
import { Transaction } from '@/types';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { formatCurrency, formatDate } from '@/utils/date';
import { getCategoryById } from '@/constants/categories';

interface TransactionItemProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
  onLongPress?: (transaction: Transaction) => void;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  onPress,
  onLongPress,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  const category = getCategoryById(transaction.category, transaction.type);
  
  const handlePress = () => {
    if (onPress) {
      onPress(transaction);
    }
  };
  
  const handleLongPress = () => {
    if (onLongPress) {
      onLongPress(transaction);
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { borderBottomColor: themeColors.border }
      ]}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        <View
          style={[
            styles.iconBackground,
            {
              backgroundColor: transaction.type === 'income'
                ? `${themeColors.income}20`
                : `${themeColors.expense}20`,
            },
          ]}
        >
          {transaction.type === 'income' ? (
            <ArrowUpRight
              size={20}
              color={themeColors.income}
            />
          ) : (
            <ArrowDownLeft
              size={20}
              color={themeColors.expense}
            />
          )}
        </View>
      </View>
      
      <View style={styles.content}>
        <View>
          <Text style={[styles.title, { color: themeColors.text }]}>
            {transaction.description}
          </Text>
          <Text style={[styles.category, { color: themeColors.subtext }]}>
            {category.name} • {formatDate(transaction.date)}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text
            style={[
              styles.amount,
              {
                color: transaction.type === 'income'
                  ? themeColors.income
                  : themeColors.expense,
              },
            ]}
          >
            {transaction.type === 'income' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '600',
  },
});