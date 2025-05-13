import { create } from "zustand";
import {
  FilterOptions,
  Transaction as TransactionType,
  Summary,
} from "@/types";
import { getDateRangeForPeriod } from "@/utils/date";
import { database } from "@/db/index";
import { Q, Collection } from "@nozbe/watermelondb";
import Transaction from "@/db/Transaction";
import { useAuthStore } from "@/stores/auth-store";
import { syncTransactions } from "@/stores/transaction-sync";
import { getAuthToken } from "@/stores/auth-store";

interface TransactionState {
  transactions: TransactionType[];
  isLoading: boolean;
  error: string | null;
  filterOptions: FilterOptions;
  filteredTransactions: TransactionType[];
  summary: Summary;
  fetchTransactions: () => Promise<void>;
  addTransaction: (transaction: Omit<TransactionType, "id">) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<TransactionType>
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  setFilterOptions: (options: Partial<FilterOptions>) => void;
  clearAll: () => Promise<void>;
  // Sync state
  isSyncing: boolean;
  lastSync: number | null;
  syncError: string | null;
  setSyncState: (
    state: Partial<
      Pick<TransactionState, "isSyncing" | "lastSync" | "syncError">
    >
  ) => void;
}

export const useTransactionStore = create<TransactionState>()((set, get) => ({
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
  // Sync state
  isSyncing: false,
  lastSync: null,
  syncError: null,
  setSyncState: (state) => set(state),

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("No user logged in");
      const collection: Collection<Transaction> =
        database.get<Transaction>("transactions");
      const txs = await collection.query(Q.where("user_id", userId)).fetch();
      const transactions = txs.map((tx) => ({
        id: tx.id,
        user_id: tx.userId,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        description: tx.description,
        date: tx.date,
        tags: tx.tagsArray,
        notes: tx.notes,
        created_at: tx.createdAt,
        updated_at: tx.updatedAt,
        sync_status: tx.syncStatus,
        version: tx.version,
      }));
      const filteredTransactions = filterTransactions(
        transactions,
        get().filterOptions
      );
      const summary = calculateSummary(transactions, filteredTransactions);
      set({ transactions, filteredTransactions, summary, isLoading: false });
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
      const userId = useAuthStore.getState().user?.id;
      if (!userId) throw new Error("No user logged in");
      await database.write(async () => {
        const collection: Collection<Transaction> =
          database.get<Transaction>("transactions");
        await collection.create((tx: Transaction) => {
          tx.userId = userId;
          tx.amount = transaction.amount;
          tx.type = transaction.type;
          tx.category = transaction.category;
          tx.description = transaction.description || "";
          tx.date = transaction.date;
          tx.tags = JSON.stringify(transaction.tags || []);
          tx.notes = transaction.notes || "";
          tx.createdAt = Date.now();
          tx.updatedAt = Date.now();
          // syncStatus may be readonly in type, but is settable in model
          tx.syncStatus = "created";
          tx.version = 1;
        });
      });
      await get().fetchTransactions();
      // Trigger sync after successful add
      const jwt = await getAuthToken();
      if (jwt && userId) {
        await syncTransactions({ userId, jwt, lastSync: get().lastSync || 0 });
        await get().fetchTransactions();
      }
    } catch (error) {
      console.error(error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to add transaction",
        isLoading: false,
      });
    }
  },

  updateTransaction: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      await database.write(async () => {
        const collection: Collection<Transaction> =
          database.get<Transaction>("transactions");
        const tx = await collection.find(id);
        await tx.update((t: Transaction) => {
          Object.entries(updates).forEach(([key, value]) => {
            if (key === "tags") {
              t.tags = JSON.stringify(value || []);
            } else if (key in t) {
              // dynamic assignment
              (t as any)[key] = value;
            }
          });
          t.updatedAt = Date.now();
          // syncStatus may be readonly in type, but is settable in model
          t.syncStatus = t.syncStatus === "created" ? "created" : "updated";
          t.version = (t.version || 1) + 1;
        });
      });
      // Refetch using the last userId
      //const userId = (get().transactions[0] as any)?.userId;
      //if (userId) await get().fetchTransactions();
      // Trigger sync after successful update
      const userIdSync = useAuthStore.getState().user?.id;
      const jwt = await getAuthToken();
      if (jwt && userIdSync) {
        // await syncTransactions({
        //   userId: userIdSync,
        //   jwt,
        //   lastSync: get().lastSync || 0,
        // });
        await get().fetchTransactions();
      }
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
      await database.write(async () => {
        const collection: Collection<Transaction> =
          database.get<Transaction>("transactions");
        const tx = await collection.find(id);
        await tx.markAsDeleted(); // Mark for sync deletion
        // Optionally, to remove it permanently after sync:
        // await tx.destroyPermanently();
      });
      // Optimistically remove from UI
      set((state) => {
        const newTransactions = state.transactions.filter((t) => t.id !== id);
        const newFilteredTransactions = state.filteredTransactions.filter(
          (t) => t.id !== id
        );
        const newSummary = calculateSummary(
          newTransactions,
          newFilteredTransactions
        );
        return {
          ...state,
          transactions: newTransactions,
          filteredTransactions: newFilteredTransactions,
          summary: newSummary,
        };
      });
      // Refetch using the last userId
      const userId = (get().transactions[0] as any)?.userId;
      if (userId) await get().fetchTransactions();
      // Trigger sync after successful delete
      const userIdSync = useAuthStore.getState().user?.id;
      const jwt = await getAuthToken();
      if (jwt && userIdSync) {
        await syncTransactions({
          userId: userIdSync,
          jwt,
          lastSync: get().lastSync || 0,
        });
        await get().fetchTransactions();
      }
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

  clearAll: async () => {
    set({
      transactions: [],
      filteredTransactions: [],
      summary: {
        totalIncome: 0,
        totalExpense: 0,
        netBalance: 0,
        categorySummary: {},
        monthlySummary: {},
      },
      error: null,
      isLoading: false,
    });
    // Optionally, clear the WatermelonDB database (dangerous: will remove all data)
    // await database.action(async () => { await database.unsafeResetDatabase(); });
  },
}));

// Helper functions to calculate filtered transactions and summary
function filterTransactions(
  transactions: TransactionType[],
  filterOptions: FilterOptions
): TransactionType[] {
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
  transactions: TransactionType[],
  filteredTransactions: TransactionType[]
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
