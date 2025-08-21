import { DatabaseService } from '../database/database.service';
import { csvParser } from './csvParser';
import { pdfParser } from './pdfParser';
import { categorizationEngine } from './categorizationEngine';
import { analyticsService } from './analyticsService';
import { aiService } from './aiService';

export interface ProcessedTransaction {
  date: Date;
  description: string;
  amount: number;
  category: string;
  confidence: number;
  account?: string;
  tags?: string[];
}

export interface ProcessingResult {
  transactions: ProcessedTransaction[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
    dateRange: { start: Date; end: Date };
  };
  insights?: any;
}

class ProcessingService {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = new DatabaseService();
  }

  async processFile(
    file: Buffer,
    filename: string,
    userId: string
  ): Promise<ProcessingResult> {
    try {
      // Parse file based on type
      let rawTransactions: any[] = [];
      
      if (filename.toLowerCase().endsWith('.csv')) {
        rawTransactions = await csvParser.parse(file);
      } else if (filename.toLowerCase().endsWith('.pdf')) {
        rawTransactions = await pdfParser.parse(file);
      } else {
        throw new Error('Unsupported file type');
      }

      // Categorize transactions
      const categorizedTransactions = await Promise.all(
        rawTransactions.map(async (tx) => {
          const category = await categorizationEngine.categorize(tx.description);
          return {
            ...tx,
            category: category.category,
            confidence: category.confidence,
            tags: category.tags
          };
        })
      );

      // Save to database
      const savedTransactions = await this.saveTransactions(
        categorizedTransactions,
        userId
      );

      // Calculate summary
      const summary = this.calculateSummary(savedTransactions);

      // Generate AI insights if enough data
      let insights = null;
      if (savedTransactions.length > 10) {
        insights = await aiService.generateInsights(savedTransactions);
        
        // Save insights to database
        if (insights) {
          await this.dbService.saveInsight(userId, insights);
        }
      }

      return {
        transactions: savedTransactions,
        summary,
        insights
      };
    } catch (error) {
      console.error('Processing error:', error);
      throw new Error(`Failed to process file: ${error.message}`);
    }
  }

  private async saveTransactions(
    transactions: ProcessedTransaction[],
    userId: string
  ): Promise<ProcessedTransaction[]> {
    const saved = [];
    
    for (const tx of transactions) {
      try {
        const result = await this.dbService.createTransaction({
          user_id: userId,
          date: tx.date,
          description: tx.description,
          amount: tx.amount,
          category: tx.category,
          account: tx.account || 'default',
          tags: tx.tags || []
        });
        
        saved.push({
          ...tx,
          id: result.id
        });
      } catch (error) {
        console.error('Failed to save transaction:', error);
      }
    }
    
    return saved;
  }

  private calculateSummary(transactions: ProcessedTransaction[]) {
    const income = transactions
      .filter(tx => tx.amount > 0)
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    const expenses = transactions
      .filter(tx => tx.amount < 0)
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    
    const dates = transactions.map(tx => tx.date).sort();
    
    return {
      totalIncome: income,
      totalExpenses: expenses,
      transactionCount: transactions.length,
      dateRange: {
        start: dates[0] || new Date(),
        end: dates[dates.length - 1] || new Date()
      }
    };
  }

  async getAnalytics(userId: string, period: string = 'month') {
    const transactions = await this.dbService.getTransactionsByUser(userId);
    return analyticsService.generateAnalytics(transactions, period);
  }

  async getCategoryBreakdown(userId: string) {
    return this.dbService.getCategoryBreakdown(userId);
  }
}

export const processingService = new ProcessingService();