import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { FilterBar } from "@/components/ui/FilterBar";
import { Card } from "@/components/ui/Card";
import { useTransactionStore } from "@/stores/transaction-store";
import { colors } from "@/constants/colors";
import { useThemeStore } from "@/stores/theme-store";
import { Period } from "@/types";
import { formatCurrency } from "@/utils/date";
import { getCategoryById } from "@/constants/categories";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "expo-router";
import { BarChart, PieChart } from "lucide-react-native";
import { DatePickerBottomSheet } from "@/components/ui/BottomSheet";

export default function ReportsScreen() {
  const router = useRouter();
  const { theme } = useThemeStore();
  const themeColors = colors[theme];

  const { filteredTransactions, summary, filterOptions, setFilterOptions } =
    useTransactionStore();

  const [showCustomDatePicker, setShowCustomDatePicker] = React.useState(false);
  const [customDate, setCustomDate] = React.useState(new Date());
  const [pendingCustom, setPendingCustom] = React.useState(false);

  const handlePeriodChange = (period: Period) => {
    if (period === "custom") {
      setPendingCustom(true);
      setShowCustomDatePicker(true);
    } else {
      setPendingCustom(false);
      setFilterOptions({ period });
    }
  };

  const handleCustomDateConfirm = (date: Date) => {
    setShowCustomDatePicker(false);
    setCustomDate(date);
    setPendingCustom(false);
    setFilterOptions({
      period: "custom",
      startDate: date.toISOString(),
      endDate: date.toISOString(),
    });
  };

  const handleFilterPress = () => {
    // In a real app, this would open a filter modal
    console.log("Filter pressed");
  };

  const handleAddTransaction = () => {
    router.push("/transaction/new");
  };

  // If no transactions, show empty state
  if (filteredTransactions.length === 0) {
    return (
      <View
        style={[styles.container, { backgroundColor: themeColors.background }]}
      >
        <View style={styles.filterContainer}>
          <FilterBar
            selectedPeriod={
              pendingCustom ? filterOptions.period : filterOptions.period
            }
            onPeriodChange={handlePeriodChange}
            onFilterPress={handleFilterPress}
          />
        </View>

        <EmptyState
          title="No data to display"
          description="Add some transactions to see your financial reports."
          actionLabel="Add Transaction"
          onAction={handleAddTransaction}
        />
      </View>
    );
  }

  // Only expense transactions for breakdown
  const expenseTransactions = filteredTransactions.filter(
    (t) => t.type === "expense"
  );
  const totalExpense = expenseTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  // Group by category
  const expenseCategoryMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    if (!expenseCategoryMap[t.category]) expenseCategoryMap[t.category] = 0;
    expenseCategoryMap[t.category] += t.amount;
  });

  const expenseCategories = Object.entries(expenseCategoryMap)
    .map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId, "expense");
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: categoryId,
        name: category.name,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Only income transactions for breakdown
  const incomeTransactions = filteredTransactions.filter(
    (t) => t.type === "income"
  );
  const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const incomeCategoryMap: Record<string, number> = {};
  incomeTransactions.forEach((t) => {
    if (!incomeCategoryMap[t.category]) incomeCategoryMap[t.category] = 0;
    incomeCategoryMap[t.category] += t.amount;
  });

  const incomeCategories = Object.entries(incomeCategoryMap)
    .map(([categoryId, amount]) => {
      const category = getCategoryById(categoryId, "income");
      const percentage = totalIncome > 0 ? (amount / totalIncome) * 100 : 0;
      return {
        id: categoryId,
        name: category.name,
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Prepare monthly data
  const monthlyData = Object.entries(summary.monthlySummary)
    .map(([month, data]) => {
      const [year, monthNum] = month.split("-");
      const date = new Date(parseInt(year), parseInt(monthNum) - 1);
      const monthName = date.toLocaleDateString("en-US", { month: "short" });

      return {
        month: `${monthName} ${year}`,
        income: data.income,
        expense: data.expense,
        net: data.income - data.expense,
      };
    })
    .sort((a, b) => {
      const [aMonth, aYear] = a.month.split(" ");
      const [bMonth, bYear] = b.month.split(" ");

      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }

      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return months.indexOf(aMonth) - months.indexOf(bMonth);
    });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.filterContainer}>
        <FilterBar
          selectedPeriod={
            pendingCustom ? filterOptions.period : filterOptions.period
          }
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

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Income Breakdown
          </Text>
          <PieChart size={20} color={themeColors.income} />
        </View>

        {incomeCategories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: themeColors.text }]}>
                {category.name}
              </Text>
              <Text
                style={[
                  styles.categoryPercentage,
                  { color: themeColors.subtext },
                ]}
              >
                {category.percentage.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.categoryBarContainer}>
              <View
                style={[
                  styles.categoryBar,
                  {
                    width: `${Math.min(category.percentage, 100)}%`,
                    backgroundColor: themeColors.income,
                  },
                ]}
              />
            </View>

            <Text
              style={[styles.categoryAmount, { color: themeColors.income }]}
            >
              {formatCurrency(category.amount)}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Expense Breakdown
          </Text>
          <PieChart size={20} color={themeColors.expense} />
        </View>

        {expenseCategories.map((category) => (
          <View key={category.id} style={styles.categoryItem}>
            <View style={styles.categoryInfo}>
              <Text style={[styles.categoryName, { color: themeColors.text }]}>
                {category.name}
              </Text>
              <Text
                style={[
                  styles.categoryPercentage,
                  { color: themeColors.subtext },
                ]}
              >
                {category.percentage.toFixed(1)}%
              </Text>
            </View>

            <View style={styles.categoryBarContainer}>
              <View
                style={[
                  styles.categoryBar,
                  {
                    width: `${Math.min(category.percentage, 100)}%`,
                    backgroundColor: themeColors.expense,
                  },
                ]}
              />
            </View>

            <Text
              style={[styles.categoryAmount, { color: themeColors.expense }]}
            >
              {formatCurrency(category.amount)}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>
            Monthly Overview
          </Text>
          <BarChart size={20} color={themeColors.primary} />
        </View>

        {monthlyData.map((item, index) => (
          <View key={index} style={styles.monthItem}>
            <Text style={[styles.monthName, { color: themeColors.text }]}>
              {item.month}
            </Text>

            <View style={styles.monthData}>
              <View style={styles.monthDataItem}>
                <Text
                  style={[
                    styles.monthDataLabel,
                    { color: themeColors.subtext },
                  ]}
                >
                  Income
                </Text>
                <Text
                  style={[styles.monthDataValue, { color: themeColors.income }]}
                >
                  {formatCurrency(item.income)}
                </Text>
              </View>

              <View style={styles.monthDataItem}>
                <Text
                  style={[
                    styles.monthDataLabel,
                    { color: themeColors.subtext },
                  ]}
                >
                  Expense
                </Text>
                <Text
                  style={[
                    styles.monthDataValue,
                    { color: themeColors.expense },
                  ]}
                >
                  {formatCurrency(item.expense)}
                </Text>
              </View>

              <View style={styles.monthDataItem}>
                <Text
                  style={[
                    styles.monthDataLabel,
                    { color: themeColors.subtext },
                  ]}
                >
                  Net
                </Text>
                <Text
                  style={[
                    styles.monthDataValue,
                    {
                      color:
                        item.net >= 0
                          ? themeColors.income
                          : themeColors.expense,
                    },
                  ]}
                >
                  {formatCurrency(item.net)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </Card>
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
  filterContainer: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  categoryItem: {
    marginBottom: 16,
  },
  categoryInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoryPercentage: {
    fontSize: 14,
  },
  categoryBarContainer: {
    height: 8,
    backgroundColor: "#E5E7EB",
    borderRadius: 4,
    marginBottom: 4,
    overflow: "hidden",
  },
  categoryBar: {
    height: "100%",
    borderRadius: 4,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
  },
  monthItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  monthName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  monthData: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  monthDataItem: {
    flex: 1,
  },
  monthDataLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  monthDataValue: {
    fontSize: 14,
    fontWeight: "500",
  },
});
