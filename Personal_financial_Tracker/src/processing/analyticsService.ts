export interface MonthlyAnalytics {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
  categories: { [key: string]: number };
  topSpending: Array<{ category: string; amount: number; percentage: number }>;
  savingsRate: number;
}

export interface TrendAnalysis {
  trend: 'increasing' | 'decreasing' | 'stable';
  percentageChange: number;
  projection: number;
}

export interface FinancialHealth {
  score: number; // 0-100
  factors: {
    savingsRate: number;
    spendingControl: number;
    incomeStability: number;
    debtManagement: number;
  };
  recommendations: string[];
}

class AnalyticsService {
  generateAnalytics(transactions: any[], period: string = 'month'): any {
    const grouped = this.groupTransactionsByPeriod(transactions, period);
    const analytics = [];

    for (const [periodKey, periodTransactions] of Object.entries(grouped)) {
      const monthlyData = this.calculateMonthlyAnalytics(
        periodKey,
        periodTransactions as any[]
      );
      analytics.push(monthlyData);
    }

    return {
      periods: analytics,
      trends: this.analyzeTrends(analytics),
      health: this.calculateFinancialHealth(analytics)
    };
  }

  private groupTransactionsByPeriod(transactions: any[], period: string): any {
    const grouped: { [key: string]: any[] } = {};

    transactions.forEach(tx => {
      const date = new Date(tx.date);
      let key: string;

      switch (period) {
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarter':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          key = `${date.getFullYear()}-Q${quarter}`;
          break;
        case 'year':
          key = String(date.getFullYear());
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(tx);
    });

    return grouped;
  }

  private calculateMonthlyAnalytics(
    month: string,
    transactions: any[]
  ): MonthlyAnalytics {
    const income = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const expenses = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

    const categories: { [key: string]: number } = {};
    
    transactions
      .filter(tx => tx.amount < 0)
      .forEach(tx => {
        const category = tx.category || 'Other';
        categories[category] = (categories[category] || 0) + Math.abs(tx.amount);
      });

    const topSpending = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: expenses > 0 ? (amount / expenses) * 100 : 0
      }));

    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

    return {
      month,
      income,
      expenses,
      netFlow: income - expenses,
      categories,
      topSpending,
      savingsRate
    };
  }

  private analyzeTrends(analytics: MonthlyAnalytics[]): TrendAnalysis {
    if (analytics.length < 2) {
      return {
        trend: 'stable',
        percentageChange: 0,
        projection: 0
      };
    }

    const recent = analytics.slice(-3);
    const expenses = recent.map(a => a.expenses);
    
    // Calculate trend
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    const changeRate = expenses.length > 1 
      ? (expenses[expenses.length - 1] - expenses[0]) / expenses[0]
      : 0;

    if (Math.abs(changeRate) < 0.05) {
      trend = 'stable';
    } else if (changeRate > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    // Simple linear projection
    const avgChange = expenses.length > 1
      ? (expenses[expenses.length - 1] - expenses[0]) / (expenses.length - 1)
      : 0;
    
    const projection = expenses[expenses.length - 1] + avgChange;

    return {
      trend,
      percentageChange: changeRate * 100,
      projection: Math.max(0, projection)
    };
  }

  private calculateFinancialHealth(analytics: MonthlyAnalytics[]): FinancialHealth {
    if (analytics.length === 0) {
      return {
        score: 50,
        factors: {
          savingsRate: 50,
          spendingControl: 50,
          incomeStability: 50,
          debtManagement: 50
        },
        recommendations: ['Not enough data for comprehensive analysis']
      };
    }

    const recent = analytics.slice(-6); // Last 6 periods
    
    // Calculate factors
    const avgSavingsRate = recent.reduce((sum, a) => sum + a.savingsRate, 0) / recent.length;
    const savingsScore = Math.min(avgSavingsRate * 2, 100);

    // Spending control - less variance is better
    const expenseVariance = this.calculateVariance(recent.map(a => a.expenses));
    const spendingScore = Math.max(100 - expenseVariance * 10, 0);

    // Income stability
    const incomeVariance = this.calculateVariance(recent.map(a => a.income));
    const incomeScore = Math.max(100 - incomeVariance * 5, 0);

    // Debt management (based on negative net flow months)
    const negativeMonths = recent.filter(a => a.netFlow < 0).length;
    const debtScore = Math.max(100 - (negativeMonths / recent.length) * 100, 0);

    const overallScore = (savingsScore + spendingScore + incomeScore + debtScore) / 4;

    // Generate recommendations
    const recommendations = [];
    
    if (savingsScore < 50) {
      recommendations.push('Increase savings rate by reducing discretionary spending');
    }
    if (spendingScore < 50) {
      recommendations.push('Stabilize monthly expenses to improve budget predictability');
    }
    if (incomeScore < 50) {
      recommendations.push('Consider diversifying income sources for stability');
    }
    if (debtScore < 50) {
      recommendations.push('Focus on reducing expenses to avoid negative cash flow');
    }

    // Top spending category recommendation
    const lastMonth = recent[recent.length - 1];
    if (lastMonth && lastMonth.topSpending.length > 0) {
      const topCategory = lastMonth.topSpending[0];
      if (topCategory.percentage > 30) {
        recommendations.push(
          `Consider reducing ${topCategory.category} spending (currently ${topCategory.percentage.toFixed(1)}% of expenses)`
        );
      }
    }

    return {
      score: Math.round(overallScore),
      factors: {
        savingsRate: Math.round(savingsScore),
        spendingControl: Math.round(spendingScore),
        incomeStability: Math.round(incomeScore),
        debtManagement: Math.round(debtScore)
      },
      recommendations: recommendations.slice(0, 3)
    };
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    
    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  async generateInsights(transactions: any[]): Promise<any> {
    const analytics = this.generateAnalytics(transactions);
    
    return {
      summary: this.generateSummary(analytics),
      trends: analytics.trends,
      health: analytics.health,
      alerts: this.generateAlerts(analytics)
    };
  }

  private generateSummary(analytics: any): string {
    const { periods, trends, health } = analytics;
    
    if (periods.length === 0) {
      return 'No transaction data available for analysis.';
    }

    const lastPeriod = periods[periods.length - 1];
    const trendText = trends.trend === 'increasing' 
      ? `increasing by ${Math.abs(trends.percentageChange).toFixed(1)}%`
      : trends.trend === 'decreasing'
      ? `decreasing by ${Math.abs(trends.percentageChange).toFixed(1)}%`
      : 'remaining stable';

    return `Your financial health score is ${health.score}/100. ` +
           `Last month you had $${lastPeriod.income.toFixed(2)} in income and ` +
           `$${lastPeriod.expenses.toFixed(2)} in expenses. ` +
           `Your spending is ${trendText}.`;
  }

  private generateAlerts(analytics: any): string[] {
    const alerts = [];
    const { periods, health } = analytics;
    
    if (periods.length > 0) {
      const lastPeriod = periods[periods.length - 1];
      
      if (lastPeriod.savingsRate < 10) {
        alerts.push('⚠️ Low savings rate detected');
      }
      
      if (lastPeriod.netFlow < 0) {
        alerts.push('🔴 Negative cash flow this period');
      }
      
      if (health.score < 50) {
        alerts.push('⚠️ Financial health needs attention');
      }
    }
    
    return alerts;
  }
}

export const analyticsService = new AnalyticsService();