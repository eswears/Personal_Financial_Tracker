export { DatabaseService, databaseService } from './database.service';

// Re-export types for convenience
export interface Transaction {
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

export interface User {
    id?: string;
    email: string;
    username?: string;
    settings?: {
        currency?: string;
        notifications?: boolean;
    };
}

export interface Category {
    id?: string;
    name: string;
    type: 'income' | 'expense' | 'transfer';
    icon?: string;
    color?: string;
    parent_id?: string;
}

export interface Budget {
    id?: string;
    user_id: string;
    category_id?: string;
    amount: number;
    period: 'monthly' | 'quarterly' | 'yearly';
    start_date: Date | string;
    end_date?: Date | string;
    is_active?: boolean;
}

export interface AIInsight {
    id?: string;
    user_id: string;
    month: Date | string;
    insights: any;
    expires_at?: Date | string;
}

export interface UploadHistory {
    id?: string;
    user_id: string;
    filename: string;
    file_type: 'csv' | 'pdf';
    status: 'pending' | 'processing' | 'completed' | 'failed';
    transaction_count?: number;
    error_message?: string;
    metadata?: any;
}