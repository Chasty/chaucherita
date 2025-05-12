import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Transaction } from '@/types';
import { TransactionItem } from '@/components/ui/TransactionItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionPress: (transaction: Transaction) => void;
  onAddTransaction: () => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onTransactionPress,
  onAddTransaction,
}) => {
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  if (transactions.length === 0) {
    return (
      <EmptyState
        title="No transactions yet"
        description="Start tracking your finances by adding your first transaction."
        actionLabel="Add Transaction"
        onAction={onAddTransaction}
      />
    );
  }
  
  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  
  transactions.forEach((transaction) => {
    const date = new Date(transaction.date);
    const dateKey = date.toISOString().split('T')[0];
    
    if (!groupedTransactions[dateKey]) {
      groupedTransactions[dateKey] = [];
    }
    
    groupedTransactions[dateKey].push(transaction);
  });
  
  // Convert to array for FlatList
  const sections = Object.keys(groupedTransactions)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
    .map((date) => ({
      date,
      data: groupedTransactions[date],
    }));
  
  const renderSectionHeader = ({ date }: { date: string }) => {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionHeaderText, { color: themeColors.text }]}>
          {formattedDate}
        </Text>
      </View>
    );
  };
  
  return (
    <FlatList
      data={sections}
      keyExtractor={(item) => item.date}
      renderItem={({ item }) => (
        <View>
          {renderSectionHeader(item)}
          {item.data.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => onTransactionPress(transaction)}
            />
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
  },
});