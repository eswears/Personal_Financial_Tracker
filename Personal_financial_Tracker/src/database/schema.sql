-- Supabase Database Schema for Personal Finance Tracker
-- Created by Agent 4

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{"currency": "USD", "notifications": true}'::jsonb
);

-- Categories table with predefined categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')),
    icon VARCHAR(50),
    color VARCHAR(7),
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    category VARCHAR(100), -- Fallback category name
    account VARCHAR(255),
    type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer')),
    tags TEXT[],
    notes TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    source VARCHAR(50) DEFAULT 'manual', -- 'manual', 'csv', 'pdf', 'bank_api'
    raw_data JSONB -- Store original parsed data
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    period VARCHAR(20) CHECK (period IN ('monthly', 'quarterly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Insights table to cache insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    insights JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
);

-- Upload history table
CREATE TABLE IF NOT EXISTS upload_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(10) CHECK (file_type IN ('csv', 'pdf')),
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    transaction_count INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB
);

-- Indexes for better performance
CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
CREATE INDEX idx_transactions_category ON transactions(category_id);
CREATE INDEX idx_transactions_month ON transactions(user_id, DATE_TRUNC('month', date));
CREATE INDEX idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX idx_ai_insights_user_month ON ai_insights(user_id, month);

-- Insert default categories
INSERT INTO categories (name, type, icon, color) VALUES
    -- Income categories
    ('Salary', 'income', '💰', '#4CAF50'),
    ('Freelance', 'income', '💼', '#8BC34A'),
    ('Investments', 'income', '📈', '#00BCD4'),
    ('Other Income', 'income', '💵', '#009688'),
    
    -- Expense categories
    ('Food & Dining', 'expense', '🍽️', '#FF5722'),
    ('Groceries', 'expense', '🛒', '#FF9800'),
    ('Transportation', 'expense', '🚗', '#FFC107'),
    ('Shopping', 'expense', '🛍️', '#FF4081'),
    ('Entertainment', 'expense', '🎬', '#E91E63'),
    ('Bills & Utilities', 'expense', '📱', '#9C27B0'),
    ('Healthcare', 'expense', '⚕️', '#673AB7'),
    ('Education', 'expense', '📚', '#3F51B5'),
    ('Travel', 'expense', '✈️', '#2196F3'),
    ('Insurance', 'expense', '🛡️', '#00ACC1'),
    ('Rent/Mortgage', 'expense', '🏠', '#43A047'),
    ('Subscription', 'expense', '📺', '#FDD835'),
    ('Personal Care', 'expense', '💅', '#FB8C00'),
    ('Gifts & Donations', 'expense', '🎁', '#8E24AA'),
    ('Taxes', 'expense', '📋', '#546E7A'),
    ('Other Expenses', 'expense', '📌', '#757575'),
    
    -- Transfer category
    ('Transfer', 'transfer', '🔄', '#607D8B')
ON CONFLICT (name) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_history ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own transactions" ON transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own budgets" ON budgets
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own insights" ON ai_insights
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own uploads" ON upload_history
    FOR ALL USING (auth.uid() = user_id);