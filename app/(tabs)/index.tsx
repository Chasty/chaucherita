import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { SummaryCard } from "@/components/ui/SummaryCard";
import { TransactionItem } from "@/components/ui/TransactionItem";
import { FilterBar } from "@/components/ui/FilterBar";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useTransactionStore } from "@/stores/transaction-store";
import { useAuthStore } from "@/stores/auth-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Period } from "@/types";
import { Plus } from "lucide-react-native";
import { DatePickerBottomSheet } from "@/components/ui/BottomSheet";

export default function DashboardScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];
  const { user } = useAuthStore();

  const {
    fetchTransactions,
    filteredTransactions,
    summary,
    filterOptions,
    setFilterOptions,
  } = useTransactionStore();

  useEffect(() => {
    if (user && user.id) {
      fetchTransactions(user.id);
    } else {
      // Clear transactions if no user
      setFilterOptions({ period: "today", type: "all" });
    }
  }, [user?.id]);

  console.log({ filteredTransactions });

  const recentTransactions = filteredTransactions.slice(0, 5);

  const [localPeriod, setLocalPeriod] = useState<Period>("today");
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
  const [customDate, setCustomDate] = useState(new Date());
  const [pendingCustom, setPendingCustom] = useState(false);

  const handlePeriodChange = (period: Period) => {
    if (period === "custom") {
      setPendingCustom(true);
      setShowCustomDatePicker(true);
    } else {
      setPendingCustom(false);
      setLocalPeriod(period);
      setFilterOptions({ period });
    }
  };

  const handleCustomDateConfirm = (date: Date) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    setShowCustomDatePicker(false);
    setCustomDate(date);
    setPendingCustom(false);
    setLocalPeriod("custom");
    setFilterOptions({
      period: "custom",
      startDate: start.toISOString(),
      endDate: end.toISOString(),
    });
  };

  const handleFilterPress = () => {
    // In a real app, this would open a filter modal
    console.log("Filter pressed");
  };

  const handleTransactionPress = (id: string) => {
    router.push(`/transaction/${id}`);
  };

  const handleAddTransaction = () => {
    router.push("/transaction/new");
  };

  const handleViewAllTransactions = () => {
    router.push("/history");
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: themeColors.text }]}>
            Hello, {user?.name || "User"}
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.subtext }]}>
            Welcome to your financial dashboard
          </Text>
        </View>
      </View>

      <FilterBar
        selectedPeriod={pendingCustom ? filterOptions.period : localPeriod}
        onPeriodChange={handlePeriodChange}
        onFilterPress={handleFilterPress}
      />

      <DatePickerBottomSheet
        visible={showCustomDatePicker}
        initialDate={customDate}
        onClose={() => {
          setShowCustomDatePicker(false);
          setPendingCustom(false);
        }}
        onConfirm={handleCustomDateConfirm}
        title="Select Custom Date"
      />

      <SummaryCard
        totalIncome={summary.totalIncome}
        totalExpense={summary.totalExpense}
        netBalance={summary.netBalance}
      />

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>
          Recent Transactions
        </Text>
        {filteredTransactions.length > 5 && (
          <Button
            title="View All"
            onPress={handleViewAllTransactions}
            variant="outline"
            size="small"
          />
        )}
      </View>

      <View style={styles.transactionsContainer}>
        {recentTransactions.length > 0 ? (
          recentTransactions.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onPress={() => handleTransactionPress(transaction.id)}
            />
          ))
        ) : (
          <EmptyState
            title="No transactions yet"
            description="Start tracking your finances by adding your first transaction."
            actionLabel="Add Transaction"
            onAction={handleAddTransaction}
          />
        )}
      </View>

      {recentTransactions.length > 0 && (
        <Button
          title="Add New Transaction"
          onPress={handleAddTransaction}
          leftIcon={<Plus size={20} color="#fff" />}
          style={styles.addButton}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  transactionsContainer: {
    marginBottom: 24,
  },
  addButton: {
    marginTop: 8,
  },
});
