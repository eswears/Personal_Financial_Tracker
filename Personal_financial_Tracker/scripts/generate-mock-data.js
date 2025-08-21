#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Categories for transactions
const expenseCategories = [
    'Food & Dining', 'Groceries', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Travel', 'Insurance',
    'Rent/Mortgage', 'Subscription', 'Personal Care', 'Gifts & Donations'
];

const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Other Income'];

// Merchant names for different categories
const merchants = {
    'Food & Dining': ['Starbucks', 'McDonalds', 'Chipotle', 'Pizza Hut', 'Subway', 'Olive Garden', 'Red Lobster'],
    'Groceries': ['Walmart', 'Target', 'Whole Foods', 'Kroger', 'Safeway', 'Trader Joes', 'Costco'],
    'Transportation': ['Uber', 'Lyft', 'Shell Gas Station', 'Chevron', 'Metro Transit', 'Airlines', 'Car Rental'],
    'Shopping': ['Amazon', 'Best Buy', 'Nike Store', 'Apple Store', 'Home Depot', 'Macys', 'Nordstrom'],
    'Entertainment': ['Netflix', 'Spotify', 'AMC Theaters', 'Concert Tickets', 'Gaming Store', 'Disney+'],
    'Bills & Utilities': ['Electric Company', 'Water Utility', 'Internet Provider', 'Phone Bill', 'Gas Company'],
    'Healthcare': ['CVS Pharmacy', 'Walgreens', 'Medical Clinic', 'Dental Office', 'Hospital'],
    'Subscription': ['Gym Membership', 'Cloud Storage', 'Software License', 'Magazine Subscription'],
    'Salary': ['Monthly Salary', 'Bi-weekly Paycheck', 'Performance Bonus'],
    'Freelance': ['Client Project Payment', 'Consulting Fee', 'Contract Work'],
    'Investments': ['Stock Dividend', 'Interest Payment', 'Investment Return']
};

// Generate random date within range
function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate random amount based on category
function randomAmount(category, isIncome = false) {
    const ranges = {
        'Food & Dining': [10, 80],
        'Groceries': [50, 250],
        'Transportation': [5, 100],
        'Shopping': [20, 500],
        'Entertainment': [10, 150],
        'Bills & Utilities': [50, 300],
        'Healthcare': [20, 500],
        'Education': [100, 1000],
        'Travel': [100, 2000],
        'Insurance': [100, 500],
        'Rent/Mortgage': [800, 3000],
        'Subscription': [5, 100],
        'Personal Care': [20, 150],
        'Gifts & Donations': [20, 300],
        'Salary': [3000, 8000],
        'Freelance': [500, 3000],
        'Investments': [50, 1000],
        'Other Income': [100, 1000]
    };

    const range = ranges[category] || [10, 100];
    const amount = Math.random() * (range[1] - range[0]) + range[0];
    return isIncome ? amount : -amount;
}

// Generate transaction description
function generateDescription(category) {
    const merchantList = merchants[category] || ['Generic Transaction'];
    const merchant = merchantList[Math.floor(Math.random() * merchantList.length)];
    
    const suffixes = ['Payment', 'Purchase', 'Transaction', 'Transfer', ''];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return suffix ? `${merchant} - ${suffix}` : merchant;
}

// Generate mock transactions
function generateTransactions(months = 6, transactionsPerMonth = 50) {
    const transactions = [];
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Add regular monthly expenses
    for (let month = 0; month < months; month++) {
        const monthStart = new Date(startDate);
        monthStart.setMonth(monthStart.getMonth() + month);
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        // Add salary (once or twice per month)
        transactions.push({
            Date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 1).toISOString().split('T')[0],
            Description: 'Monthly Salary Deposit',
            Amount: 5000,
            Category: 'Salary',
            Account: 'Checking Account'
        });

        // Add rent/mortgage (once per month)
        transactions.push({
            Date: new Date(monthStart.getFullYear(), monthStart.getMonth(), 5).toISOString().split('T')[0],
            Description: 'Rent Payment - Apartment',
            Amount: -1500,
            Category: 'Rent/Mortgage',
            Account: 'Checking Account'
        });

        // Add random transactions
        for (let i = 0; i < transactionsPerMonth - 2; i++) {
            const isIncome = Math.random() < 0.1; // 10% chance of income
            const category = isIncome 
                ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
                : expenseCategories[Math.floor(Math.random() * expenseCategories.length)];

            const transaction = {
                Date: randomDate(monthStart, monthEnd).toISOString().split('T')[0],
                Description: generateDescription(category),
                Amount: parseFloat(randomAmount(category, isIncome).toFixed(2)),
                Category: category,
                Account: Math.random() < 0.8 ? 'Checking Account' : 'Credit Card'
            };

            transactions.push(transaction);
        }
    }

    // Sort by date
    transactions.sort((a, b) => new Date(a.Date) - new Date(b.Date));

    return transactions;
}

// Generate CSV content
function generateCSV(transactions) {
    const fields = ['Date', 'Description', 'Amount', 'Category', 'Account'];
    
    try {
        const csv = parse(transactions, { fields });
        return csv;
    } catch (err) {
        console.error('Error generating CSV:', err);
        return '';
    }
}

// Generate PDF-like text content
function generatePDFText(transactions) {
    let content = 'BANK STATEMENT\n';
    content += '='.repeat(50) + '\n\n';
    content += 'Account Holder: John Doe\n';
    content += 'Account Number: ****1234\n';
    content += 'Statement Period: ' + transactions[0].Date + ' to ' + transactions[transactions.length - 1].Date + '\n\n';
    content += 'TRANSACTION DETAILS\n';
    content += '-'.repeat(50) + '\n\n';

    let balance = 10000; // Starting balance

    transactions.forEach(t => {
        balance += t.Amount;
        content += `Date: ${t.Date}\n`;
        content += `Description: ${t.Description}\n`;
        content += `Amount: $${Math.abs(t.Amount).toFixed(2)} ${t.Amount < 0 ? 'DR' : 'CR'}\n`;
        content += `Balance: $${balance.toFixed(2)}\n`;
        content += '-'.repeat(30) + '\n\n';
    });

    content += '\n' + '='.repeat(50) + '\n';
    content += `Ending Balance: $${balance.toFixed(2)}\n`;

    return content;
}

// Main function
function main() {
    const args = process.argv.slice(2);
    const format = args[0] || 'csv';
    const months = parseInt(args[1]) || 6;
    const outputDir = path.join(__dirname, '..', 'sample-data');

    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`Generating mock ${format.toUpperCase()} data for ${months} months...`);

    const transactions = generateTransactions(months);

    if (format === 'csv') {
        const csvContent = generateCSV(transactions);
        const outputFile = path.join(outputDir, `mock-bank-statement-${Date.now()}.csv`);
        fs.writeFileSync(outputFile, csvContent);
        console.log(`✅ Generated CSV file: ${outputFile}`);
        console.log(`   Total transactions: ${transactions.length}`);
    } else if (format === 'pdf-text') {
        const pdfContent = generatePDFText(transactions);
        const outputFile = path.join(outputDir, `mock-bank-statement-${Date.now()}.txt`);
        fs.writeFileSync(outputFile, pdfContent);
        console.log(`✅ Generated PDF-like text file: ${outputFile}`);
        console.log(`   Total transactions: ${transactions.length}`);
    } else if (format === 'both') {
        // Generate both formats
        const csvContent = generateCSV(transactions);
        const csvFile = path.join(outputDir, `mock-bank-statement-${Date.now()}.csv`);
        fs.writeFileSync(csvFile, csvContent);
        
        const pdfContent = generatePDFText(transactions);
        const pdfFile = path.join(outputDir, `mock-bank-statement-${Date.now()}.txt`);
        fs.writeFileSync(pdfFile, pdfContent);
        
        console.log(`✅ Generated both formats:`);
        console.log(`   CSV: ${csvFile}`);
        console.log(`   PDF-text: ${pdfFile}`);
        console.log(`   Total transactions: ${transactions.length}`);
    } else {
        console.error('Invalid format. Use: csv, pdf-text, or both');
        process.exit(1);
    }

    // Also generate a sample for immediate testing
    const sampleTransactions = transactions.slice(0, 10);
    console.log('\n📊 Sample transactions:');
    console.table(sampleTransactions.map(t => ({
        Date: t.Date,
        Description: t.Description.substring(0, 30),
        Amount: `$${Math.abs(t.Amount).toFixed(2)}`,
        Type: t.Amount > 0 ? 'Income' : 'Expense'
    })));
}

// Run if executed directly
if (require.main === module) {
    main();
}

module.exports = { generateTransactions, generateCSV, generatePDFText };