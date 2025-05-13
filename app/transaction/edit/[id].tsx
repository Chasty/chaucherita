import React from "react";
import { View, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useTransactionStore } from "@/stores/transaction-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Transaction } from "@/types";

export default function EditTransactionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { transactions, updateTransaction } = useTransactionStore();
  const transaction = transactions.find((t) => t.id === id);

  const handleSubmit = (data: Omit<Transaction, "id">) => {
    if (transaction) {
      updateTransaction(transaction.id, data);
      router.replace("/(tabs)");
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (!transaction) {
    return null;
  }

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TransactionForm
        initialData={transaction}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
