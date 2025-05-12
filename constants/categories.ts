export const categories = {
  income: [
    { id: 'salary', name: 'Salary', icon: 'briefcase' },
    { id: 'freelance', name: 'Freelance', icon: 'laptop' },
    { id: 'investments', name: 'Investments', icon: 'trending-up' },
    { id: 'gifts', name: 'Gifts', icon: 'gift' },
    { id: 'other_income', name: 'Other', icon: 'plus-circle' },
  ],
  expense: [
    { id: 'food', name: 'Food & Dining', icon: 'utensils' },
    { id: 'transportation', name: 'Transportation', icon: 'car' },
    { id: 'housing', name: 'Housing', icon: 'home' },
    { id: 'utilities', name: 'Utilities', icon: 'zap' },
    { id: 'entertainment', name: 'Entertainment', icon: 'film' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping-bag' },
    { id: 'health', name: 'Health', icon: 'activity' },
    { id: 'education', name: 'Education', icon: 'book' },
    { id: 'personal', name: 'Personal', icon: 'user' },
    { id: 'travel', name: 'Travel', icon: 'map' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'repeat' },
    { id: 'other_expense', name: 'Other', icon: 'more-horizontal' },
  ]
};

export const getCategoryById = (id: string, type: 'income' | 'expense') => {
  return categories[type].find(cat => cat.id === id) || 
    { id, name: id.charAt(0).toUpperCase() + id.slice(1), icon: 'circle' };
};

export const getAllCategories = () => {
  return [...categories.income, ...categories.expense];
};