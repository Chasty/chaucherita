export type Transaction = {
  id: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: string; // ISO string
  tags?: string[];
  notes?: string;
};

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Period = "today" | "last7" | "last15" | "last30" | "custom";

export type FilterOptions = {
  period: Period;
  startDate?: string;
  endDate?: string;
  category?: string;
  type?: "income" | "expense" | "all";
  searchQuery?: string;
};

export type Summary = {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  categorySummary: Record<string, number>;
  monthlySummary: Record<string, { income: number; expense: number }>;
};
