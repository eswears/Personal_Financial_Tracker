import { DatabaseService } from '../database/database.service';

export interface AIInsight {
  summary: string;
  recommendations: string[];
  projections: {
    period: string;
    expectedIncome: number;
    expectedExpenses: number;
    confidence: number;
  }[];
  alerts: string[];
  budgetSuggestions: {
    category: string;
    currentSpending: number;
    recommendedBudget: number;
    savingsPotential: number;
  }[];
}

class AIService {
  private dbService: DatabaseService;
  private apiKey: string | undefined;

  constructor() {
    this.dbService = new DatabaseService();
    this.apiKey = process.env.ANTHROPIC_API_KEY;
  }

  async generateInsights(
    transactions: any[],
    userId?: string
  ): Promise<AIInsight> {
    // Analyze transaction patterns
    const analysis = this.analyzeTransactions(transactions);
    
    // Generate insights (with or without AI)
    let insights: AIInsight;
    
    if (this.apiKey) {
      insights = await this.generateAIInsights(analysis);
    } else {
      insights = this.generateRuleBasedInsights(analysis);
    }

    // Save insights to database if userId provided
    if (userId) {
      await this.saveInsights(userId, insights);
    }

    return insights;
  }

  private analyzeTransactions(transactions: any[]) {
    const monthlyData: { [key: string]: any } = {};
    const categoryTotals: { [key: string]: number } = {};
    
    transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          income: 0,
          expenses: 0,
          transactions: []
        };
      }
      
      if (tx.amount > 0) {
        monthlyData[monthKey].income += tx.amount;
      } else {
        monthlyData[monthKey].expenses += Math.abs(tx.amount);
        const category = tx.category || 'Other';
        categoryTotals[category] = (categoryTotals[category] || 0) + Math.abs(tx.amount);
      }
      
      monthlyData[monthKey].transactions.push(tx);
    });

    return {
      monthlyData,
      categoryTotals,
      totalTransactions: transactions.length,
      dateRange: this.getDateRange(transactions)
    };
  }

  private async generateAIInsights(analysis: any): Promise<AIInsight> {
    try {
      // Prepare data for AI
      const prompt = this.buildAIPrompt(analysis);
      
      // Make API call to Claude
      const response = await this.callClaudeAPI(prompt);
      
      // Parse and structure the response
      return this.parseAIResponse(response, analysis);
    } catch (error) {
      console.warn('AI service unavailable, falling back to rule-based insights');
      return this.generateRuleBasedInsights(analysis);
    }
  }

  private generateRuleBasedInsights(analysis: any): AIInsight {
    const { monthlyData, categoryTotals } = analysis;
    const months = Object.keys(monthlyData).sort();
    
    // Calculate averages
    const avgIncome = this.calculateAverage(
      months.map(m => monthlyData[m].income)
    );
    const avgExpenses = this.calculateAverage(
      months.map(m => monthlyData[m].expenses)
    );
    
    // Generate summary
    const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpenses) / avgIncome) * 100 : 0;
    const summary = `Based on your transaction history, you have an average monthly income of $${avgIncome.toFixed(2)} ` +
                   `and average monthly expenses of $${avgExpenses.toFixed(2)}, ` +
                   `resulting in a ${savingsRate.toFixed(1)}% savings rate.`;
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(
      categoryTotals,
      avgIncome,
      avgExpenses,
      savingsRate
    );
    
    // Generate projections
    const projections = this.generateProjections(monthlyData, months);
    
    // Generate alerts
    const alerts = this.generateAlerts(savingsRate, avgExpenses, categoryTotals);
    
    // Generate budget suggestions
    const budgetSuggestions = this.generateBudgetSuggestions(
      categoryTotals,
      avgExpenses
    );
    
    return {
      summary,
      recommendations,
      projections,
      alerts,
      budgetSuggestions
    };
  }

  private generateRecommendations(
    categoryTotals: any,
    avgIncome: number,
    avgExpenses: number,
    savingsRate: number
  ): string[] {
    const recommendations = [];
    
    // Savings rate recommendation
    if (savingsRate < 20) {
      recommendations.push(
        `Aim to increase your savings rate to at least 20%. Currently at ${savingsRate.toFixed(1)}%.`
      );
    }
    
    // Top spending categories
    const sortedCategories = Object.entries(categoryTotals)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 3);
    
    for (const [category, amount] of sortedCategories) {
      const percentage = ((amount as number) / avgExpenses) * 100;
      if (percentage > 25) {
        recommendations.push(
          `Consider reducing ${category} spending (${percentage.toFixed(1)}% of budget)`
        );
      }
    }
    
    // Emergency fund
    const monthlyNetIncome = avgIncome - avgExpenses;
    if (monthlyNetIncome > 0) {
      const emergencyFundMonths = 3000 / monthlyNetIncome; // Assuming $3000 emergency fund goal
      recommendations.push(
        `Build an emergency fund of 3-6 months expenses (approximately $${(avgExpenses * 3).toFixed(0)})`
      );
    }
    
    return recommendations.slice(0, 4);
  }

  private generateProjections(
    monthlyData: any,
    months: string[]
  ): AIInsight['projections'] {
    const recentMonths = months.slice(-3);
    const projections = [];
    
    // Calculate trend
    const recentIncome = recentMonths.map(m => monthlyData[m].income);
    const recentExpenses = recentMonths.map(m => monthlyData[m].expenses);
    
    const incomeTrend = this.calculateTrend(recentIncome);
    const expenseTrend = this.calculateTrend(recentExpenses);
    
    // Project next 3 months
    for (let i = 1; i <= 3; i++) {
      const lastDate = new Date(months[months.length - 1] + '-01');
      lastDate.setMonth(lastDate.getMonth() + i);
      const period = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, '0')}`;
      
      projections.push({
        period,
        expectedIncome: Math.max(0, recentIncome[recentIncome.length - 1] + (incomeTrend * i)),
        expectedExpenses: Math.max(0, recentExpenses[recentExpenses.length - 1] + (expenseTrend * i)),
        confidence: Math.max(0.3, 0.9 - (i * 0.2))
      });
    }
    
    return projections;
  }

  private generateAlerts(
    savingsRate: number,
    avgExpenses: number,
    categoryTotals: any
  ): string[] {
    const alerts = [];
    
    if (savingsRate < 0) {
      alerts.push('⚠️ Spending exceeds income - immediate action needed');
    } else if (savingsRate < 10) {
      alerts.push('⚠️ Low savings rate - consider reducing discretionary spending');
    }
    
    // Check for high spending categories
    for (const [category, amount] of Object.entries(categoryTotals)) {
      const percentage = ((amount as number) / avgExpenses) * 100;
      if (percentage > 40) {
        alerts.push(`⚠️ ${category} spending is ${percentage.toFixed(0)}% of budget`);
      }
    }
    
    return alerts.slice(0, 3);
  }

  private generateBudgetSuggestions(
    categoryTotals: any,
    avgExpenses: number
  ): AIInsight['budgetSuggestions'] {
    const suggestions = [];
    
    // Standard budget percentages
    const standardBudget: { [key: string]: number } = {
      'Housing': 0.30,
      'Food & Dining': 0.12,
      'Transportation': 0.15,
      'Utilities': 0.05,
      'Entertainment': 0.05,
      'Shopping': 0.05,
      'Healthcare': 0.05,
      'Insurance': 0.10,
      'Other': 0.13
    };
    
    for (const [category, amount] of Object.entries(categoryTotals)) {
      const currentSpending = amount as number;
      const currentPercentage = currentSpending / avgExpenses;
      const recommendedPercentage = standardBudget[category] || 0.05;
      const recommendedBudget = avgExpenses * recommendedPercentage;
      
      if (currentSpending > recommendedBudget * 1.2) {
        suggestions.push({
          category,
          currentSpending,
          recommendedBudget,
          savingsPotential: currentSpending - recommendedBudget
        });
      }
    }
    
    return suggestions.sort((a, b) => b.savingsPotential - a.savingsPotential).slice(0, 5);
  }

  private async saveInsights(userId: string, insights: AIInsight) {
    try {
      await this.dbService.saveInsight(userId, {
        type: 'ai_analysis',
        data: insights,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to save insights:', error);
    }
  }

  private buildAIPrompt(analysis: any): string {
    return `Analyze the following financial data and provide insights:
    ${JSON.stringify(analysis, null, 2)}
    
    Please provide:
    1. A summary of financial health
    2. 3-4 actionable recommendations
    3. Budget suggestions for overspending categories
    4. Any urgent alerts or warnings`;
  }

  private async callClaudeAPI(prompt: string): Promise<any> {
    // Placeholder for actual Claude API integration
    // This would make an HTTP request to the Claude API
    throw new Error('Claude API not configured');
  }

  private parseAIResponse(response: any, analysis: any): AIInsight {
    // Parse the AI response and structure it
    // For now, fall back to rule-based
    return this.generateRuleBasedInsights(analysis);
  }

  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    return (values[values.length - 1] - values[0]) / values.length;
  }

  private getDateRange(transactions: any[]): { start: Date; end: Date } {
    const dates = transactions.map(tx => new Date(tx.date)).sort();
    return {
      start: dates[0] || new Date(),
      end: dates[dates.length - 1] || new Date()
    };
  }
}

export const aiService = new AIService();