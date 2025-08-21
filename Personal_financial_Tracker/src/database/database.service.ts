import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

interface Transaction {
    id?: string;
    user_id?: string;
    date: Date | string;
    description: string;
    amount: number;
    category?: string;
    category_id?: string;
    account?: string;
    type?: 'income' | 'expense' | 'transfer';
    tags?: string[];
    notes?: string;
    is_recurring?: boolean;
    source?: string;
    raw_data?: any;
}

interface User {
    id?: string;
    email: string;
    username?: string;
    settings?: {
        currency?: string;
        notifications?: boolean;
    };
}

interface Category {
    id?: string;
    name: string;
    type: 'income' | 'expense' | 'transfer';
    icon?: string;
    color?: string;
    parent_id?: string;
}

interface Budget {
    id?: string;
    user_id: string;
    category_id?: string;
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    start_date: Date | string;
    end_date?: Date | string;
    is_active?: boolean;
}

interface AIInsight {
    id?: string;
    user_id: string;
    month: Date | string;
    insights: any;
    expires_at?: Date | string;
}

interface UploadHistory {
    id?: string;
    user_id: string;
    filename: string;
    file_type: 'csv' | 'pdf';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transaction_count?: number;
    error_message?: string;
    metadata?: any;
}

export class DatabaseService {
    private supabase: SupabaseClient;
    private isInitialized: boolean = false;

    constructor() {
        const supabaseUrl = process.env.SUPABASE_URL || '';
        const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || '';

        if (!supabaseUrl || !supabaseKey) {
            console.warn('Supabase credentials not found. Database operations will be simulated.');
            // Create a mock client for development
            this.supabase = {} as SupabaseClient;
        } else {
            this.supabase = createClient(supabaseUrl, supabaseKey);
            this.isInitialized = true;
        }
    }

    // User operations
    async createUser(user: User): Promise<User | null> {
        if (!this.isInitialized) return this.mockCreateUser(user);

        const { data, error } = await this.supabase
            .from('users')
            .insert(user)
            .select()
            .single();

        if (error) {
            console.error('Error creating user:', error);
            return null;
        }
        return data;
    }

    async getUserById(userId: string): Promise<User | null> {
        if (!this.isInitialized) return this.mockGetUser(userId);

        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user:', error);
            return null;
        }
        return data;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        if (!this.isInitialized) return this.mockGetUser(email);

        const { data, error } = await this.supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error('Error fetching user by email:', error);
            return null;
        }
        return data;
    }

    // Transaction operations
    async createTransaction(transaction: Transaction): Promise<Transaction | null> {
        if (!this.isInitialized) return this.mockCreateTransaction(transaction);

        const { data, error } = await this.supabase
            .from('transactions')
            .insert(transaction)
            .select()
            .single();

        if (error) {
            console.error('Error creating transaction:', error);
            return null;
        }
        return data;
    }

    async createTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        if (!this.isInitialized) return transactions.map(t => ({ ...t, id: Math.random().toString() }));

        const { data, error } = await this.supabase
            .from('transactions')
            .insert(transactions)
            .select();

        if (error) {
            console.error('Error creating transactions:', error);
            return [];
        }
        return data || [];
    }

    async getTransactions(userId: string, startDate?: Date, endDate?: Date): Promise<Transaction[]> {
        if (!this.isInitialized) return this.mockGetTransactions(userId);

        let query = this.supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .order('date', { ascending: false });

        if (startDate) {
            query = query.gte('date', startDate.toISOString());
        }
        if (endDate) {
            query = query.lte('date', endDate.toISOString());
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            return [];
        }
        return data || [];
    }

    async getTransactionsByCategory(userId: string, categoryId: string): Promise<Transaction[]> {
        if (!this.isInitialized) return [];

        const { data, error } = await this.supabase
            .from('transactions')
            .select('*')
            .eq('user_id', userId)
            .eq('category_id', categoryId)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching transactions by category:', error);
            return [];
        }
        return data || [];
    }

    async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<Transaction | null> {
        if (!this.isInitialized) return null;

        const { data, error } = await this.supabase
            .from('transactions')
            .update(updates)
            .eq('id', transactionId)
            .select()
            .single();

        if (error) {
            console.error('Error updating transaction:', error);
            return null;
        }
        return data;
    }

    async deleteTransaction(transactionId: string): Promise<boolean> {
        if (!this.isInitialized) return true;

        const { error } = await this.supabase
            .from('transactions')
            .delete()
            .eq('id', transactionId);

        if (error) {
            console.error('Error deleting transaction:', error);
            return false;
        }
        return true;
    }

    // Category operations
    async getCategories(): Promise<Category[]> {
        if (!this.isInitialized) return this.mockGetCategories();

        const { data, error } = await this.supabase
            .from('categories')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
        return data || [];
    }

    async createCategory(category: Category): Promise<Category | null> {
        if (!this.isInitialized) return category;

        const { data, error } = await this.supabase
            .from('categories')
            .insert(category)
            .select()
            .single();

        if (error) {
            console.error('Error creating category:', error);
            return null;
        }
        return data;
    }

    // Budget operations
    async createBudget(budget: Budget): Promise<Budget | null> {
        if (!this.isInitialized) return budget;

        const { data, error } = await this.supabase
            .from('budgets')
            .insert(budget)
            .select()
            .single();

        if (error) {
            console.error('Error creating budget:', error);
            return null;
        }
        return data;
    }

    async getBudgets(userId: string, isActive?: boolean): Promise<Budget[]> {
        if (!this.isInitialized) return [];

        let query = this.supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId);

        if (isActive !== undefined) {
            query = query.eq('is_active', isActive);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching budgets:', error);
            return [];
        }
        return data || [];
    }

    async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget | null> {
        if (!this.isInitialized) return null;

        const { data, error } = await this.supabase
            .from('budgets')
            .update(updates)
            .eq('id', budgetId)
            .select()
            .single();

        if (error) {
            console.error('Error updating budget:', error);
            return null;
        }
        return data;
    }

    // AI Insights operations
    async saveAIInsight(insight: AIInsight): Promise<AIInsight | null> {
        if (!this.isInitialized) return insight;

        const { data, error } = await this.supabase
            .from('ai_insights')
            .upsert(insight)
            .select()
            .single();

        if (error) {
            console.error('Error saving AI insight:', error);
            return null;
        }
        return data;
    }

    async getAIInsight(userId: string, month: Date): Promise<AIInsight | null> {
        if (!this.isInitialized) return null;

        const monthStr = month.toISOString().slice(0, 7) + '-01'; // Format as YYYY-MM-01

        const { data, error } = await this.supabase
            .from('ai_insights')
            .select('*')
            .eq('user_id', userId)
            .eq('month', monthStr)
            .gte('expires_at', new Date().toISOString())
            .single();

        if (error) {
            console.error('Error fetching AI insight:', error);
            return null;
        }
        return data;
    }

    // Upload history operations
    async createUploadRecord(upload: UploadHistory): Promise<UploadHistory | null> {
        if (!this.isInitialized) return upload;

        const { data, error } = await this.supabase
            .from('upload_history')
            .insert(upload)
            .select()
            .single();

        if (error) {
            console.error('Error creating upload record:', error);
            return null;
        }
        return data;
    }

    async updateUploadStatus(
        uploadId: string,
        status: UploadHistory['status'],
        transactionCount?: number,
        errorMessage?: string
    ): Promise<boolean> {
        if (!this.isInitialized) return true;

        const updates: any = { status };
        if (transactionCount !== undefined) updates.transaction_count = transactionCount;
        if (errorMessage) updates.error_message = errorMessage;

        const { error } = await this.supabase
            .from('upload_history')
            .update(updates)
            .eq('id', uploadId);

        if (error) {
            console.error('Error updating upload status:', error);
            return false;
        }
        return true;
    }

    async getUploadHistory(userId: string): Promise<UploadHistory[]> {
        if (!this.isInitialized) return [];

        const { data, error } = await this.supabase
            .from('upload_history')
            .select('*')
            .eq('user_id', userId)
            .order('upload_date', { ascending: false });

        if (error) {
            console.error('Error fetching upload history:', error);
            return [];
        }
        return data || [];
    }

    // Analytics queries
    async getSpendingByCategory(userId: string, startDate: Date, endDate: Date): Promise<any[]> {
        if (!this.isInitialized) return [];

        // Simplified query without join to avoid relationship errors
        const { data, error } = await this.supabase
            .from('transactions')
            .select('category, amount')
            .eq('user_id', userId)
            .eq('type', 'expense')
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString());

        if (error) {
            console.error('Error fetching spending by category:', error);
            return [];
        }

        // Aggregate by category
        const categoryMap = new Map();
        (data || []).forEach((transaction: any) => {
            const key = transaction.category || 'Uncategorized';
            const current = categoryMap.get(key) || { 
                category: key, 
                amount: 0,
                color: this.getCategoryColor(key)
            };
            current.amount += Math.abs(transaction.amount);
            categoryMap.set(key, current);
        });

        return Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
    }

    private getCategoryColor(category: string): string {
        const colors: { [key: string]: string } = {
            'Food & Dining': '#FF5722',
            'Groceries': '#FF9800',
            'Transportation': '#FFC107',
            'Shopping': '#FF4081',
            'Entertainment': '#E91E63',
            'Bills & Utilities': '#9C27B0',
            'Healthcare': '#673AB7',
            'Education': '#3F51B5',
            'Travel': '#2196F3',
            'Insurance': '#00ACC1',
            'Rent/Mortgage': '#43A047',
            'Subscription': '#FDD835',
            'Personal Care': '#FB8C00',
            'Gifts & Donations': '#8E24AA',
            'Taxes': '#546E7A',
            'Salary': '#4CAF50',
            'Freelance': '#8BC34A',
            'Investments': '#00BCD4',
            'Other Income': '#009688'
        };
        return colors[category] || '#757575';
    }

    async getMonthlyTrends(userId: string, months: number = 6): Promise<any[]> {
        if (!this.isInitialized) return [];

        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        const { data, error } = await this.supabase
            .from('transactions')
            .select('date, amount, type')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString())
            .lte('date', endDate.toISOString())
            .order('date');

        if (error) {
            console.error('Error fetching monthly trends:', error);
            return [];
        }

        // Aggregate by month
        const monthMap = new Map();
        (data || []).forEach((transaction: any) => {
            const monthKey = transaction.date.slice(0, 7); // YYYY-MM
            const current = monthMap.get(monthKey) || { month: monthKey, income: 0, expenses: 0 };
            
            if (transaction.type === 'income') {
                current.income += transaction.amount;
            } else if (transaction.type === 'expense') {
                current.expenses += Math.abs(transaction.amount);
            }
            
            monthMap.set(monthKey, current);
        });

        return Array.from(monthMap.values()).sort((a, b) => a.month.localeCompare(b.month));
    }

    // Mock methods for development
    private mockCreateUser(user: User): User {
        return { ...user, id: Math.random().toString() };
    }

    private mockGetUser(identifier: string): User {
        return {
            id: Math.random().toString(),
            email: identifier.includes('@') ? identifier : 'user@example.com',
            username: 'Test User',
            settings: { currency: 'USD', notifications: true }
        };
    }

    private mockCreateTransaction(transaction: Transaction): Transaction {
        return { ...transaction, id: Math.random().toString() };
    }

    private mockGetTransactions(userId: string): Transaction[] {
        return [
            {
                id: '1',
                user_id: userId,
                date: new Date(),
                description: 'Sample Transaction',
                amount: -50.00,
                category: 'Food & Dining',
                type: 'expense'
            }
        ];
    }

    private mockGetCategories(): Category[] {
        return [
            { id: '1', name: 'Food & Dining', type: 'expense', icon: '🍽️', color: '#FF5722' },
            { id: '2', name: 'Transportation', type: 'expense', icon: '🚗', color: '#FFC107' },
            { id: '3', name: 'Salary', type: 'income', icon: '💰', color: '#4CAF50' },
            { id: '4', name: 'Shopping', type: 'expense', icon: '🛍️', color: '#FF4081' },
            { id: '5', name: 'Entertainment', type: 'expense', icon: '🎬', color: '#E91E63' }
        ];
    }
}

// Export singleton instance
export const databaseService = new DatabaseService();