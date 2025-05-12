import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTransactionStore } from '@/stores/transaction-store';
import { colors } from '@/constants/colors';
import { useThemeStore } from '@/stores/theme-store';
import { formatCurrency, formatDate } from '@/utils/date';
import { getCategoryById } from '@/constants/categories';
import { ArrowDownLeft, ArrowUpRight, Edit, Trash2 } from 'lucide-react-native';

export default function TransactionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  
  const { transactions, deleteTransaction } = useTransactionStore();
  const transaction = transactions.find(t => t.id === id);
  
  if (!transaction) {
    return (
      <View style={[styles.container, { backgroundColor: themeColors.background }]}>
        <Text style={[styles.errorText, { color: themeColors.error }]}>
          Transaction not found
        </Text>
      </View>
    );
  }
  
  const category = getCategoryById(transaction.category, transaction.type);
  
  const handleEdit = () => {
    router.push(`/transaction/edit/${id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Transaction',
      'Are you sure you want to delete this transaction?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            deleteTransaction(id);
            router.back();
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={styles.headerButtons}>
              <Button
                title="Edit"
                onPress={handleEdit}
                variant="outline"
                size="small"
                leftIcon={<Edit size={16} color={themeColors.primary} />}
                style={styles.headerButton}
              />
            </View>
          ),
        }}
      />
      
      <View style={styles.content}>
        <View style={styles.amountContainer}>
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
                size={24}
                color={themeColors.income}
              />
            ) : (
              <ArrowDownLeft
                size={24}
                color={themeColors.expense}
              />
            )}
          </View>
          
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
        
        <Card style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subtext }]}>
              Description
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {transaction.description}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subtext }]}>
              Category
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {category.name}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subtext }]}>
              Date
            </Text>
            <Text style={[styles.detailValue, { color: themeColors.text }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: themeColors.subtext }]}>
              Type
            </Text>
            <Text
              style={[
                styles.detailValue,
                {
                  color: transaction.type === 'income'
                    ? themeColors.income
                    : themeColors.expense,
                },
              ]}
            >
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </Text>
          </View>
          
          {transaction.notes && (
            <View style={styles.notesContainer}>
              <Text style={[styles.detailLabel, { color: themeColors.subtext }]}>
                Notes
              </Text>
              <Text style={[styles.notesText, { color: themeColors.text }]}>
                {transaction.notes}
              </Text>
            </View>
          )}
        </Card>
        
        <Button
          title="Delete Transaction"
          onPress={handleDelete}
          variant="danger"
          leftIcon={<Trash2 size={20} color="#fff" />}
          style={styles.deleteButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 8,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  detailsCard: {
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  detailLabel: {
    fontSize: 16,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
  },
  notesText: {
    fontSize: 16,
    marginTop: 8,
    lineHeight: 22,
  },
  deleteButton: {
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 24,
  },
});