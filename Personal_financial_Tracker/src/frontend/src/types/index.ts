export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  category: string;
  account: string;
  originalDescription?: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface SpendingTrend {
  month: string;
  year: number;
  income: number;
  expenses: number;
  net: number;
  categories: CategoryBreakdown[];
}

export interface AIInsight {
  summary: string;
  budgetHealth: 'good' | 'warning' | 'critical';
  recommendations: string[];
  alerts: {
    type: 'subscription' | 'unusual' | 'overspending';
    message: string;
    amount?: number;
  }[];
  projections: {
    period: string;
    projected: number;
    recommended: number;
  }[];
}

export interface FileUploadResponse {
  success: boolean;
  transactionCount: number;
  dateRange: {
    start: Date;
    end: Date;
  };
  message?: string;
}