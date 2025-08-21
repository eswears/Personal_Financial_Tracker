// Simple transaction categorization based on description keywords

const categoryRules = [
    // Income categories
    { keywords: ['salary', 'paycheck', 'wage', 'payroll'], category: 'Salary', type: 'income' },
    { keywords: ['dividend', 'interest', 'investment'], category: 'Investments', type: 'income' },
    { keywords: ['freelance', 'contract', 'consulting'], category: 'Freelance', type: 'income' },
    
    // Food & Dining
    { keywords: ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'pizza', 'burger'], category: 'Food & Dining', type: 'expense' },
    { keywords: ['grocery', 'supermarket', 'walmart', 'target', 'whole foods', 'trader joe'], category: 'Groceries', type: 'expense' },
    
    // Transportation
    { keywords: ['uber', 'lyft', 'taxi', 'transit', 'metro', 'bus'], category: 'Transportation', type: 'expense' },
    { keywords: ['gas', 'fuel', 'shell', 'chevron', 'exxon'], category: 'Transportation', type: 'expense' },
    
    // Shopping
    { keywords: ['amazon', 'ebay', 'online', 'store', 'shop'], category: 'Shopping', type: 'expense' },
    { keywords: ['clothing', 'shoes', 'apparel', 'fashion'], category: 'Shopping', type: 'expense' },
    
    // Entertainment
    { keywords: ['netflix', 'spotify', 'hulu', 'disney', 'streaming'], category: 'Entertainment', type: 'expense' },
    { keywords: ['movie', 'theater', 'concert', 'game', 'sport'], category: 'Entertainment', type: 'expense' },
    
    // Bills & Utilities
    { keywords: ['electric', 'gas', 'water', 'utility', 'power'], category: 'Bills & Utilities', type: 'expense' },
    { keywords: ['internet', 'phone', 'mobile', 'verizon', 'att', 't-mobile'], category: 'Bills & Utilities', type: 'expense' },
    
    // Healthcare
    { keywords: ['pharmacy', 'cvs', 'walgreens', 'medical', 'doctor', 'hospital'], category: 'Healthcare', type: 'expense' },
    { keywords: ['dental', 'dentist', 'health', 'clinic'], category: 'Healthcare', type: 'expense' },
    
    // Home
    { keywords: ['rent', 'mortgage', 'lease', 'apartment'], category: 'Rent/Mortgage', type: 'expense' },
    { keywords: ['home depot', 'lowes', 'furniture', 'repair'], category: 'Home', type: 'expense' },
    
    // Insurance
    { keywords: ['insurance', 'geico', 'allstate', 'progressive'], category: 'Insurance', type: 'expense' },
    
    // Education
    { keywords: ['tuition', 'school', 'college', 'university', 'course', 'education'], category: 'Education', type: 'expense' },
    { keywords: ['book', 'textbook', 'udemy', 'coursera'], category: 'Education', type: 'expense' },
    
    // Travel
    { keywords: ['airline', 'flight', 'hotel', 'airbnb', 'travel', 'vacation'], category: 'Travel', type: 'expense' },
    
    // Subscriptions
    { keywords: ['subscription', 'membership', 'gym', 'fitness'], category: 'Subscription', type: 'expense' },
    
    // Personal Care
    { keywords: ['salon', 'spa', 'barber', 'beauty', 'cosmetic'], category: 'Personal Care', type: 'expense' },
    
    // Transfers
    { keywords: ['transfer', 'withdrawal', 'deposit', 'atm'], category: 'Transfer', type: 'transfer' }
];

export function categorizeTransaction(description: string, amount: number): string {
    const lowerDesc = description.toLowerCase();
    
    // First, determine if it's income based on amount
    if (amount > 0) {
        // Check income keywords
        for (const rule of categoryRules.filter(r => r.type === 'income')) {
            if (rule.keywords.some(keyword => lowerDesc.includes(keyword))) {
                return rule.category;
            }
        }
        return 'Other Income';
    }
    
    // Check expense categories
    for (const rule of categoryRules.filter(r => r.type === 'expense')) {
        if (rule.keywords.some(keyword => lowerDesc.includes(keyword))) {
            return rule.category;
        }
    }
    
    // Check transfer categories
    for (const rule of categoryRules.filter(r => r.type === 'transfer')) {
        if (rule.keywords.some(keyword => lowerDesc.includes(keyword))) {
            return rule.category;
        }
    }
    
    // Default categories
    return amount > 0 ? 'Other Income' : 'Other Expenses';
}

export function getCategoryType(category: string): 'income' | 'expense' | 'transfer' {
    const rule = categoryRules.find(r => r.category === category);
    return rule ? rule.type : (category.toLowerCase().includes('income') ? 'income' : 'expense');
}

export function getAllCategories(): string[] {
    return [...new Set(categoryRules.map(r => r.category))];
}