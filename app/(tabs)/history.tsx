import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { FilterBar } from "@/components/ui/FilterBar";
import { TransactionList } from "@/components/transactions/TransactionList";
import { useTransactionStore } from "@/stores/transaction-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Period } from "@/types";
import { DatePickerBottomSheet } from "@/components/ui/BottomSheet";

export default function HistoryScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { filteredTransactions, filterOptions, setFilterOptions } =
    useTransactionStore();

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

  const handleTransactionPress = (transaction: any) => {
    router.push(`/transaction/${transaction.id}`);
  };

  const handleAddTransaction = () => {
    router.push("/transaction/new");
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.filterContainer}>
        <FilterBar
          selectedPeriod={pendingCustom ? filterOptions.period : localPeriod}
          onPeriodChange={handlePeriodChange}
          onFilterPress={handleFilterPress}
        />
      </View>
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
      <TransactionList
        transactions={filteredTransactions}
        onTransactionPress={handleTransactionPress}
        onAddTransaction={handleAddTransaction}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
});
