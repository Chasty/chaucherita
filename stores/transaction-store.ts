import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FilterOptions, Transaction, Summary } from "@/types";
import { getDateRangeForPeriod } from "@/utils/date";
import { getAuthToken } from "@/stores/auth-store";

const API_URL = "http://localhost:5007/api/transactions";

// Debug function to check AsyncStorage
const debugAsyncStorage = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("AsyncStorage keys:", keys);
    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      console.log(`AsyncStorage ${key}:`, value);
    }
  } catch (error) {
    console.error("Error reading AsyncStorage:", error);
  }
};

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  filteredTransactions: Transaction[];
  summary: Summary;

  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<Transaction, "id">) => Promise<void>;
  updateTransaction: (
    id: string,
    transaction: Partial<Transaction>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
}

export const useTransactionStore = create<TransactionState>()(
  persist(
    (set, get) => ({
      transactions: [],
      isLoading: false,
      error: null,
      filterOptions: {
        period: "today",
        type: "all",
      },
      filteredTransactions: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        categorySummary: {},
        monthlySummary: {},
      },

      fetchTransactions: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = await getAuthToken();
          const res = await fetch(API_URL, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to fetch transactions");
          set((state) => {
            const filteredTransactions = filterTransactions(
              data,
              state.filterOptions
            );
            const summary = calculateSummary(data, filteredTransactions);
            return {
              ...state,
              transactions: data,
              filteredTransactions,
              summary,
              isLoading: false,
            };
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch transactions",
            isLoading: false,
          });
        }
      },

      addTransaction: async (transaction) => {
        set({ isLoading: true, error: null });
        try {
          const token = await getAuthToken();
          const res = await fetch(API_URL, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              ...transaction,
              date: new Date(transaction.date).toISOString(),
            }),
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to add transaction");
          // Refetch all transactions to keep in sync
          await get().fetchTransactions();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to add transaction",
            isLoading: false,
          });
        }
      },

      updateTransaction: async (id, updatedFields) => {
        set({ isLoading: true, error: null });
        try {
          const token = await getAuthToken();
          const res = await fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedFields),
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Failed to update transaction");
          await get().fetchTransactions();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update transaction",
            isLoading: false,
          });
        }
      },

      deleteTransaction: async (id) => {
        set({ isLoading: true, error: null });
        try {
          const token = await getAuthToken();
          const res = await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error("Failed to delete transaction");
          await get().fetchTransactions();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete transaction",
            isLoading: false,
          });
        }
      },

      setFilterOptions: (options) => {
        set((state) => {
          const newFilterOptions = { ...state.filterOptions, ...options };
          const filteredTransactions = filterTransactions(
            state.transactions,
            newFilterOptions
          );
          const summary = calculateSummary(
            state.transactions,
            filteredTransactions
          );

          return {
            ...state,
            filterOptions: newFilterOptions,
            filteredTransactions,
            summary,
          };
        });
      },
    }),
    {
      name: "transactions-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        transactions: state.transactions,
        filterOptions: state.filterOptions,
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        console.log("Migration running:", { persistedState, version });
        if (version === 0) {
          // Handle migration from version 0 to 1
          return {
            ...persistedState,
            transactions: persistedState.transactions || [],
            filterOptions: persistedState.filterOptions || {
              period: "month",
              type: "all",
            },
          };
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Calculate initial filtered transactions and summary
          const filteredTransactions = filterTransactions(
            state.transactions,
            state.filterOptions
          );
          const summary = calculateSummary(
            state.transactions,
            filteredTransactions
          );

          // Update state with calculated values
          useTransactionStore.setState({
            transactions: state.transactions,
            filterOptions: state.filterOptions,
            filteredTransactions,
            summary,
          });
        }
        console.log("State rehydrated:", state);
        debugAsyncStorage();
      },
    }
  )
);

// Helper functions to calculate filtered transactions and summary
function filterTransactions(
  transactions: Transaction[],
  filterOptions: FilterOptions
): Transaction[] {
  const filtered = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date);

    // Filter by date range
    if (filterOptions.period !== "custom") {
      // Use today as the base date for the range
      const { startDate, endDate } = getDateRangeForPeriod(
        filterOptions.period,
        new Date() // always use today
      );
      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }
    } else if (filterOptions.startDate && filterOptions.endDate) {
      const start = new Date(filterOptions.startDate);
      const end = new Date(filterOptions.endDate);
      if (transactionDate < start || transactionDate > end) {
        return false;
      }
    }

    // Filter by type
    if (
      filterOptions.type &&
      filterOptions.type !== "all" &&
      transaction.type !== filterOptions.type
    ) {
      return false;
    }

    // Filter by category
    if (
      filterOptions.category &&
      transaction.category !== filterOptions.category
    ) {
      return false;
    }

    // Filter by search query
    if (filterOptions.searchQuery) {
      const query = filterOptions.searchQuery.toLowerCase();
      return (
        transaction.description.toLowerCase().includes(query) ||
        transaction.category.toLowerCase().includes(query) ||
        (transaction.notes && transaction.notes.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Sort transactions by date in descending order (most recent first)
  return filtered.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

function calculateSummary(
  transactions: Transaction[],
  filteredTransactions: Transaction[]
): Summary {
  // These should use ALL transactions
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // These should use FILTERED transactions
  const categorySummary: Record<string, number> = {};
  filteredTransactions.forEach((t) => {
    if (!categorySummary[t.category]) {
      categorySummary[t.category] = 0;
    }
    categorySummary[t.category] += t.amount;
  });

  const monthlySummary: Record<string, { income: number; expense: number }> =
    {};
  filteredTransactions.forEach((t) => {
    const date = new Date(t.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!monthlySummary[monthYear]) {
      monthlySummary[monthYear] = { income: 0, expense: 0 };
    }

    if (t.type === "income") {
      monthlySummary[monthYear].income += t.amount;
    } else {
      monthlySummary[monthYear].expense += t.amount;
    }
  });

  return {
    totalIncome,
    totalExpense,
    netBalance,
    categorySummary,
    monthlySummary,
  };
}
