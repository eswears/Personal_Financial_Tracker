const path = require('path');

// Load environment variables from .env.local file
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs').promises;
const compression = require('compression');
const helmet = require('helmet');

// Import services
const { databaseService } = require('../database');
const { processFile } = require('../processing/fileProcessor');
const { categorizeTransactions } = require('../processing/categorizer');
const { generateInsights } = require('../services/aiService');

const app = express();
const PORT = process.env.PORT || 3200;

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests from any localhost port during development
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/pdf', 'text/plain', 'application/vnd.ms-excel'];
    const allowedExtensions = ['.csv', '.pdf', '.txt'];
    const fileExt = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// File upload endpoint
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileType = req.body.type || (req.file.originalname.endsWith('.pdf') ? 'pdf' : 'csv');
    
    // Read the file
    const fileContent = await fs.readFile(req.file.path);
    
    // Process the file
    const transactions = await processFile(fileContent, fileType);
    
    // Categorize transactions
    const categorizedTransactions = await categorizeTransactions(transactions);
    
    // Add a default user_id and map fields correctly for database
    const transactionsWithUser = categorizedTransactions.map(t => ({
      user_id: 'default-user-123',
      date: t.date,
      description: t.description,
      amount: t.amount,
      category: t.category,
      account: t.account,
      original_description: t.merchant || t.description,  // Store merchant info here
      type: t.amount < 0 ? 'expense' : 'income',
      source: 'csv',
      raw_data: { merchant: t.merchant, originalAmount: t.amount }
    }));
    
    // Save to database
    const saved = await databaseService.createTransactions(transactionsWithUser);
    
    // Clean up uploaded file
    await fs.unlink(req.file.path);
    
    res.json({
      success: true,
      transactionCount: saved.length,
      dateRange: {
        start: saved[0]?.date || new Date(),
        end: saved[saved.length - 1]?.date || new Date()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Failed to clean up file:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
});

// Transaction endpoints
app.get('/api/transactions', async (req, res) => {
  try {
    // Use default user for testing (should be replaced with authenticated user)
    const transactions = await databaseService.getTransactions('default-user-123');
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

app.get('/api/transactions/:id', async (req, res) => {
  try {
    const transaction = await databaseService.getTransaction(req.params.id);
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch transaction' });
  }
});

app.put('/api/transactions/:id/category', async (req, res) => {
  try {
    const { category } = req.body;
    const updated = await databaseService.updateTransactionCategory(req.params.id, category);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Analytics endpoints
app.get('/api/analytics/categories', async (req, res) => {
  try {
    // Get all transactions for the user
    const transactions = await databaseService.getTransactions('default-user-123');
    
    // Filter for expenses in the last month
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    // Aggregate by category
    const categoryMap = new Map();
    transactions.forEach(t => {
      const transDate = new Date(t.date);
      if (t.amount < 0 && transDate >= startDate && transDate <= endDate) {
        const category = t.category || 'Uncategorized';
        const current = categoryMap.get(category) || { category, amount: 0 };
        current.amount += Math.abs(t.amount);
        categoryMap.set(category, current);
      }
    });
    
    // Convert to array and sort by amount
    const categories = Array.from(categoryMap.values())
      .sort((a, b) => b.amount - a.amount)
      .map(cat => ({
        ...cat,
        color: getCategoryColor(cat.category)
      }));
    
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

function getCategoryColor(category) {
  const colors = {
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
    'Taxes': '#546E7A'
  };
  return colors[category] || '#757575';
}

app.get('/api/analytics/trends', async (req, res) => {
  try {
    // Use default user for testing (should be replaced with authenticated user)
    const trends = await databaseService.getMonthlyTrends('default-user-123', 6);
    res.json(trends);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    
    const [transactions, categories, trends] = await Promise.all([
      databaseService.getTransactions('default-user-123'),
      databaseService.getSpendingByCategory('default-user-123', startDate, endDate),
      databaseService.getMonthlyTrends('default-user-123')
    ]);
    
    const currentMonth = trends[trends.length - 1] || {};
    
    res.json({
      transactionCount: transactions.length,
      monthlyIncome: currentMonth.income || 0,
      monthlyExpenses: currentMonth.expenses || 0,
      monthlyNet: currentMonth.net || 0,
      topCategories: categories.slice(0, 5),
      recentTransactions: transactions.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// AI endpoints
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { timeRange = 'month', focusAreas = [] } = req.body;
    const transactions = await databaseService.getTransactions();
    const insights = await generateInsights(transactions, timeRange, focusAreas);
    res.json(insights);
  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

app.get('/api/ai/recommendations', async (req, res) => {
  try {
    const transactions = await databaseService.getTransactions();
    const insights = await generateInsights(transactions, 'month');
    res.json(insights.recommendations || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, userId = 'default-user-123' } = req.body;
    
    // Get user's financial data for context
    const [transactions, trends, categories] = await Promise.all([
      databaseService.getTransactions(userId),
      databaseService.getMonthlyTrends(userId),
      databaseService.getSpendingByCategory(userId, new Date(new Date().setMonth(new Date().getMonth() - 1)), new Date())
    ]);

    // Calculate financial metrics
    const monthlyIncome = trends[trends.length - 1]?.income || 0;
    const monthlyExpenses = trends[trends.length - 1]?.expenses || 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;

    // Prepare context for AI
    const financialContext = {
      monthlyIncome: monthlyIncome,
      monthlyExpenses: monthlyExpenses,
      savingsRate: savingsRate,
      totalTransactions: transactions.length,
      topCategories: categories.slice(0, 10),
      recentTransactions: transactions.slice(0, 20),
      trends: trends
    };

    // Call AI service with financial context
    const aiResponse = await callAIService(message, financialContext);
    
    res.json({ 
      response: aiResponse.content,
      actions: aiResponse.actions || []
    });

  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
});

// AI service function using Claude API
async function callAIService(userMessage, financialContext) {
  const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }
  
  // Debug API key format (showing only first/last few characters)
  console.log('API Key format check:', CLAUDE_API_KEY.substring(0, 10) + '...' + CLAUDE_API_KEY.substring(CLAUDE_API_KEY.length - 10));

  const systemPrompt = `You are a professional financial advisor AI assistant with access to the user's complete financial data. 

FINANCIAL CONTEXT:
- Monthly Income: $${financialContext.monthlyIncome}
- Monthly Expenses: $${financialContext.monthlyExpenses}
- Savings Rate: ${financialContext.savingsRate}%
- Total Transactions: ${financialContext.totalTransactions}

TOP SPENDING CATEGORIES:
${financialContext.topCategories.map((cat, i) => `${i+1}. ${cat.category}: $${cat.amount.toFixed(2)}/month`).join('\n')}

MONTHLY TRENDS:
${financialContext.trends.map(trend => `${trend.month}: Income $${trend.income}, Expenses $${trend.expenses}`).join('\n')}

RECENT TRANSACTIONS (sample):
${financialContext.recentTransactions.slice(0, 5).map(t => `${t.date}: ${t.description} - $${t.amount} (${t.category})`).join('\n')}

INSTRUCTIONS:
1. Provide specific, actionable financial advice based on the actual data
2. Use exact numbers from the user's financial data
3. Be conversational but professional
4. Focus on practical recommendations
5. If asked about spending breakdown, provide detailed category analysis
6. If asked about savings opportunities, identify specific areas with dollar amounts
7. Explain financial concepts clearly
8. Keep responses concise but informative (max 500 words)
9. When referencing categories, use the exact category names from the data

Respond to the user's question with specific insights based on their actual financial situation.`;

  try {
    console.log('Attempting Claude API call...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\nUser question: ${userMessage}`
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error response:', errorText);
      throw new Error(`Claude API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiContent = data.content[0]?.text || 'I apologize, but I encountered an error processing your request.';

    // Analyze response to suggest actions
    const actions = [];
    if (aiContent.toLowerCase().includes('category') || aiContent.toLowerCase().includes('breakdown')) {
      actions.push({ label: 'View Analytics', action: 'analytics' });
    }
    if (aiContent.toLowerCase().includes('savings') || aiContent.toLowerCase().includes('reduce')) {
      actions.push({ label: 'Create Forecast', action: 'forecast' });
    }
    if (aiContent.toLowerCase().includes('transaction')) {
      actions.push({ label: 'View Transactions', action: 'transactions' });
    }

    return {
      content: aiContent,
      actions: actions
    };

  } catch (error) {
    console.error('Claude API call failed:', error);
    return {
      content: `I'm experiencing technical difficulties connecting to my AI service. However, I can share some basic insights about your finances:

Your monthly spending is $${financialContext.monthlyExpenses.toFixed(2)} with a savings rate of ${financialContext.savingsRate}%. Your top spending category is ${financialContext.topCategories[0]?.category} at $${financialContext.topCategories[0]?.amount.toFixed(2)}/month.

Please check your internet connection and try again, or contact support if the issue persists.`,
      actions: [
        { label: 'View Analytics', action: 'analytics' },
        { label: 'Create Forecast', action: 'forecast' }
      ]
    };
  }
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📊 API endpoints available:');
  console.log('   POST /api/upload');
  console.log('   GET  /api/transactions');
  console.log('   GET  /api/analytics/categories');
  console.log('   GET  /api/analytics/trends');
  console.log('   POST /api/ai/insights');
});

module.exports = app;