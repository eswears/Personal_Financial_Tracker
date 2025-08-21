const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

async function generateInsights(transactions, timeRange = 'month', focusAreas = []) {
  // Calculate basic analytics
  const analytics = analyzeTransactions(transactions);
  
  // Determine budget health
  const budgetHealth = determineBudgetHealth(analytics);
  
  // Generate recommendations
  const recommendations = generateRecommendations(analytics, budgetHealth);
  
  // Detect alerts
  const alerts = detectAlerts(transactions, analytics);
  
  // Create projections
  const projections = createProjections(analytics);
  
  // If we have Claude API key, enhance with AI
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const aiEnhancedInsights = await callClaudeForInsights(analytics, recommendations, timeRange, focusAreas);
      if (aiEnhancedInsights) {
        // Merge AI insights with our rule-based insights
        return {
          summary: aiEnhancedInsights.summary || generateSummary(analytics, budgetHealth),
          budgetHealth,
          recommendations: aiEnhancedInsights.recommendations || recommendations,
          alerts,
          projections: aiEnhancedInsights.projections || projections
        };
      }
    } catch (error) {
      console.error('Claude API error, using fallback:', error);
    }
  }
  
  return {
    summary: generateSummary(analytics, budgetHealth),
    budgetHealth,
    recommendations,
    alerts,
    projections
  };
}

function analyzeTransactions(transactions) {
  const now = new Date();
  const thisMonth = transactions.filter(t => {
    const txDate = new Date(t.date);
    return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
  });
  
  const income = thisMonth
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = thisMonth
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const categories = {};
  thisMonth.forEach(t => {
    if (t.amount < 0) {
      categories[t.category] = (categories[t.category] || 0) + Math.abs(t.amount);
    }
  });
  
  const topCategory = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])[0];
  
  return {
    monthlyIncome: income,
    monthlyExpenses: expenses,
    monthlyNet: income - expenses,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0,
    topCategory: topCategory ? topCategory[0] : 'none',
    topCategoryAmount: topCategory ? topCategory[1] : 0,
    categoriesBreakdown: categories,
    transactionCount: thisMonth.length
  };
}

function determineBudgetHealth(analytics) {
  const { savingsRate, monthlyNet } = analytics;
  
  if (savingsRate >= 20 && monthlyNet > 0) {
    return 'good';
  } else if (savingsRate >= 10 || monthlyNet > 0) {
    return 'warning';
  } else {
    return 'critical';
  }
}

function generateSummary(analytics, health) {
  const { monthlyIncome, monthlyExpenses, savingsRate, topCategory } = analytics;
  
  if (health === 'critical') {
    return `⚠️ Your spending exceeds income by $${Math.abs(analytics.monthlyNet).toFixed(2)} this month. Your highest spending category is ${topCategory} at $${analytics.topCategoryAmount.toFixed(2)}. Immediate action needed to reduce expenses.`;
  } else if (health === 'warning') {
    return `Your current savings rate is ${savingsRate.toFixed(1)}%. Consider reducing ${topCategory} spending to improve your financial health.`;
  } else {
    return `Great job! You're saving ${savingsRate.toFixed(1)}% of your income. Keep maintaining your current spending habits.`;
  }
}

function generateRecommendations(analytics, health) {
  const recommendations = [];
  const { categoriesBreakdown, monthlyIncome, monthlyExpenses } = analytics;
  
  if (health === 'critical') {
    recommendations.push(`Reduce ${analytics.topCategory} spending by at least $${(analytics.topCategoryAmount * 0.3).toFixed(2)} to improve budget`);
    recommendations.push('Consider finding additional income sources');
    recommendations.push('Review and cancel unnecessary subscriptions');
  }
  
  if (categoriesBreakdown.food > monthlyIncome * 0.15) {
    recommendations.push('Your food spending is high. Consider meal planning and cooking at home more often');
  }
  
  if (categoriesBreakdown.entertainment > monthlyIncome * 0.1) {
    recommendations.push('Entertainment expenses are above recommended 10% of income. Look for free activities');
  }
  
  if (analytics.savingsRate < 20) {
    recommendations.push(`Aim to save at least 20% of income. You need to reduce spending by $${(monthlyExpenses * 0.1).toFixed(2)}`);
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Maintain your current spending patterns');
    recommendations.push('Consider investing your surplus savings');
  }
  
  return recommendations;
}

function detectAlerts(transactions, analytics) {
  const alerts = [];
  
  // Check for recurring subscriptions
  const recurring = detectRecurringCharges(transactions);
  recurring.forEach(charge => {
    alerts.push({
      type: 'subscription',
      message: `Recurring charge detected: ${charge.description} - $${Math.abs(charge.amount).toFixed(2)}/month`,
      amount: Math.abs(charge.amount)
    });
  });
  
  // Check for unusual spending
  if (analytics.topCategoryAmount > analytics.monthlyIncome * 0.3) {
    alerts.push({
      type: 'overspending',
      message: `${analytics.topCategory} spending is ${((analytics.topCategoryAmount / analytics.monthlyIncome) * 100).toFixed(1)}% of income`,
      amount: analytics.topCategoryAmount
    });
  }
  
  // Check for large transactions
  const largeTransactions = transactions.filter(t => Math.abs(t.amount) > analytics.monthlyIncome * 0.1);
  largeTransactions.slice(0, 2).forEach(t => {
    alerts.push({
      type: 'unusual',
      message: `Large transaction: ${t.description} - $${Math.abs(t.amount).toFixed(2)}`,
      amount: Math.abs(t.amount)
    });
  });
  
  return alerts;
}

function detectRecurringCharges(transactions) {
  const grouped = {};
  
  transactions.forEach(t => {
    const key = t.description.toLowerCase().replace(/[0-9]/g, '').trim();
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(t);
  });
  
  const recurring = [];
  Object.entries(grouped).forEach(([key, txns]) => {
    if (txns.length >= 2) {
      const amounts = txns.map(t => Math.abs(t.amount));
      const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      if (Math.max(...amounts) - Math.min(...amounts) < avgAmount * 0.1) {
        recurring.push({
          description: txns[0].description,
          amount: -avgAmount,
          frequency: 'monthly'
        });
      }
    }
  });
  
  return recurring;
}

function createProjections(analytics) {
  const { monthlyIncome, monthlyExpenses, monthlyNet } = analytics;
  
  return [
    {
      period: '3 Months',
      projected: monthlyNet * 3,
      recommended: monthlyIncome * 0.2 * 3
    },
    {
      period: '6 Months',
      projected: monthlyNet * 6,
      recommended: monthlyIncome * 0.2 * 6
    },
    {
      period: '1 Year',
      projected: monthlyNet * 12,
      recommended: monthlyIncome * 0.2 * 12
    }
  ];
}

async function callClaudeForInsights(analytics, baseRecommendations, timeRange, focusAreas) {
  const CLAUDE_API_KEY = process.env.ANTHROPIC_API_KEY;
  
  if (!CLAUDE_API_KEY) {
    return null;
  }

  const systemPrompt = `You are a professional financial advisor AI. Analyze the provided financial data and generate insights, recommendations, and projections.

FINANCIAL DATA:
- Monthly Income: $${analytics.monthlyIncome.toFixed(2)}
- Monthly Expenses: $${analytics.monthlyExpenses.toFixed(2)}
- Monthly Net: $${analytics.monthlyNet.toFixed(2)}
- Savings Rate: ${analytics.savingsRate.toFixed(1)}%
- Top Spending Category: ${analytics.topCategory} ($${analytics.topCategoryAmount.toFixed(2)})
- Transaction Count: ${analytics.transactionCount}

SPENDING BREAKDOWN:
${Object.entries(analytics.categoriesBreakdown).map(([cat, amount]) => `- ${cat}: $${amount.toFixed(2)}`).join('\n')}

CURRENT RECOMMENDATIONS:
${baseRecommendations.map(rec => `- ${rec}`).join('\n')}

TIME RANGE: ${timeRange}
FOCUS AREAS: ${focusAreas.join(', ') || 'General financial health'}

Please provide:
1. A concise financial summary (2-3 sentences)
2. 3-5 specific, actionable recommendations
3. 3 financial projections (3 month, 6 month, 1 year scenarios)

Format your response as JSON with this structure:
{
  "summary": "brief financial health summary",
  "recommendations": ["recommendation 1", "recommendation 2", ...],
  "projections": [
    {"period": "3 Months", "projected": number, "recommended": number},
    {"period": "6 Months", "projected": number, "recommended": number},
    {"period": "1 Year", "projected": number, "recommended": number}
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: systemPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status);
      return null;
    }

    const data = await response.json();
    const aiContent = data.content[0]?.text;
    
    if (aiContent) {
      try {
        return JSON.parse(aiContent);
      } catch (parseError) {
        console.error('Failed to parse Claude response as JSON:', parseError);
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Claude API call failed:', error);
    return null;
  }
}

module.exports = {
  generateInsights
};