import React from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { useTransactionStore } from "@/stores/transaction-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Transaction } from "@/types";

export default function NewTransactionScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const { addTransaction } = useTransactionStore();

  const handleSubmit = (data: Omit<Transaction, "id">) => {
    console.log({ data });
    addTransaction(data);
    router.back();
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <TransactionForm onSubmit={handleSubmit} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
