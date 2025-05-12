import { Period } from "@/types";

export const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getDateRangeForPeriod = (
  period: Period,
  date = new Date()
): { startDate: Date; endDate: Date } => {
  const currentDate = new Date(date);
  let startDate = new Date(currentDate);
  let endDate = new Date(currentDate);

  switch (period) {
    case "today":
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last7":
      startDate.setDate(currentDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last15":
      startDate.setDate(currentDate.getDate() - 14);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "last30":
      startDate.setDate(currentDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
    case "custom":
      // For custom, return the same date (will be overridden by actual custom dates)
      break;
    default:
      // fallback to today
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      break;
  }

  return { startDate, endDate };
};

export const getMonthName = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short" });
};

export const getMonthYear = (date: Date) => {
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};
