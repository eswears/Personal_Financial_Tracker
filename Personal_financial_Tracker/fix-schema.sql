-- Fix missing columns in transactions table
-- Run this in Supabase SQL Editor

-- Add missing type column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) CHECK (type IN ('income', 'expense', 'transfer'));

-- Update existing records to have a type based on amount
UPDATE transactions 
SET type = CASE 
    WHEN amount >= 0 THEN 'income'
    ELSE 'expense'
END
WHERE type IS NULL;

-- Make type column NOT NULL after updating existing records
ALTER TABLE transactions 
ALTER COLUMN type SET NOT NULL;

-- Add raw_data column if it doesn't exist
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS raw_data JSONB;

-- Add source column if it doesn't exist  
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';

-- Add notes column if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add tags column if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add is_recurring column if it doesn't exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;

-- Verify the structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'transactions'
ORDER BY ordinal_position;