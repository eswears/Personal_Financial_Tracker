import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar, Treemap } from 'recharts';
import { FileUpload } from './FileUpload';
import { getTransactions, getTrends, getCategories, getInsights } from '../services/api';
import type { Transaction, SpendingTrend, CategoryBreakdown, AIInsight } from '../types';

// Enhanced Icon Component with more icons
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    wallet: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    trending: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    pie: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
      </svg>
    ),
    alert: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bulb: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    save: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
      </svg>
    ),
    target: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    rocket: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    check: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    x: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )
  };
  
  return icons[name as keyof typeof icons] || null;
};

// Financial Health Score Component
const FinancialHealthScore: React.FC<{ score: number; breakdown: any }> = ({ score, breakdown }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    if (score >= 40) return '#ef4444';
    return '#dc2626';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  const data = [{ name: 'Score', value: score, fill: getScoreColor(score) }];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Financial Health Score</h3>
      <div className="flex items-center justify-between">
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={data} startAngle={180} endAngle={0}>
              <RadialBar dataKey="value" cornerRadius={10} fill={getScoreColor(score)} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="relative -mt-32 text-center">
            <div className="text-4xl font-bold" style={{ color: getScoreColor(score) }}>{score}</div>
            <div className="text-sm text-gray-600">{getScoreLabel(score)}</div>
          </div>
        </div>
        <div className="flex-1 ml-6">
          <div className="space-y-3">
            {Object.entries(breakdown).map(([key, value]: [string, any]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{key}</span>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                    <div 
                      className="h-2 rounded-full" 
                      style={{ 
                        width: `${value.score}%`, 
                        backgroundColor: getScoreColor(value.score) 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium" style={{ color: getScoreColor(value.score) }}>
                    {value.score}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// AI Quick Actions Component
const AIQuickActions: React.FC<{ actions: any[] }> = ({ actions }) => {
  const [completedActions, setCompletedActions] = useState<string[]>([]);

  const handleActionClick = (actionId: string) => {
    setCompletedActions([...completedActions, actionId]);
    // Here you would implement the actual action
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">AI-Powered Quick Actions</h3>
        <Icon name="rocket" className="w-6 h-6 text-blue-600" />
      </div>
      <div className="space-y-3">
        {actions.map((action) => (
          <div 
            key={action.id}
            className={`flex items-start p-4 rounded-lg border transition-all cursor-pointer ${
              completedActions.includes(action.id) 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-200'
            }`}
            onClick={() => !completedActions.includes(action.id) && handleActionClick(action.id)}
          >
            <div className={`p-2 rounded-lg mr-3 ${
              action.priority === 'high' ? 'bg-red-100 text-red-600' :
              action.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
              'bg-green-100 text-green-600'
            }`}>
              <Icon name={completedActions.includes(action.id) ? 'check' : action.icon} className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{action.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              {action.savings && (
                <p className="text-sm font-medium text-green-600 mt-2">
                  Potential savings: ${action.savings}/month
                </p>
              )}
            </div>
            {!completedActions.includes(action.id) && (
              <div className="ml-3">
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  action.priority === 'high' ? 'bg-red-100 text-red-700' :
                  action.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {action.priority}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Spending Distribution Pie Chart
const SpendingDistribution: React.FC<{ categories: CategoryBreakdown[] }> = ({ categories }) => {
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  
  const data = categories.map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    color: COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {((payload[0].value / categories.reduce((sum, cat) => sum + cat.amount, 0)) * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Spending Distribution</h3>
      <div className="flex items-center">
        <div className="w-64 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex-1 ml-6">
          <div className="space-y-2">
            {data.slice(0, 6).map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  ${item.value.toFixed(0)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Month-over-Month Comparison
const MonthComparison: React.FC<{ trends: SpendingTrend[] }> = ({ trends }) => {
  const data = trends.map(trend => ({
    month: new Date(trend.month).toLocaleDateString('en-US', { month: 'short' }),
    income: trend.income,
    expenses: trend.expenses,
    savings: trend.income - trend.expenses
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Month-over-Month Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
          <Area type="monotone" dataKey="expenses" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
          <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Budget vs Actual Component
const BudgetVsActual: React.FC<{ budgets: any[], actuals: any[] }> = ({ budgets, actuals }) => {
  const data = budgets.map(budget => {
    const actual = actuals.find(a => a.category === budget.category) || { amount: 0 };
    return {
      category: budget.category,
      budget: budget.amount,
      actual: actual.amount,
      variance: budget.amount - actual.amount,
      percentUsed: (actual.amount / budget.amount) * 100
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget vs Actual Spending</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => `$${value.toFixed(2)}`}
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          />
          <Legend />
          <Bar dataKey="budget" fill="#93c5fd" name="Budget" />
          <Bar dataKey="actual" fill="#3b82f6" name="Actual" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 space-y-2">
        {data.filter(d => d.percentUsed > 90).map(item => (
          <div key={item.category} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
            <span className="text-sm font-medium text-red-800">{item.category}</span>
            <span className="text-sm text-red-600">{item.percentUsed.toFixed(0)}% of budget used</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Savings Opportunities Component
const SavingsOpportunities: React.FC<{ opportunities: any[] }> = ({ opportunities }) => {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-sm border border-green-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Savings Opportunities</h3>
        <Icon name="save" className="w-6 h-6 text-green-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {opportunities.map((opp, index) => (
          <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
            <div className="flex items-start">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Icon name="bulb" className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{opp.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{opp.description}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-lg font-bold text-green-600">
                    Save ${opp.amount}/mo
                  </span>
                  <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                    Apply →
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium text-gray-900">Total Potential Savings</span>
          <span className="text-2xl font-bold text-green-600">
            ${opportunities.reduce((sum, opp) => sum + opp.amount, 0)}/month
          </span>
        </div>
      </div>
    </div>
  );
};

export const EnhancedDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate financial metrics
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentTrend = trends.find(t => t.month === currentMonth) || trends[0];
  const monthlyIncome = currentTrend?.income || 0;
  const monthlyExpenses = currentTrend?.expenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) * 100 : 0;

  // Calculate financial health score
  const financialHealthScore = Math.round(
    (savingsRate > 20 ? 40 : savingsRate * 2) +
    (monthlyExpenses < monthlyIncome * 0.7 ? 30 : 15) +
    (categories.length > 0 ? 20 : 10) +
    (transactions.length > 50 ? 10 : 5)
  );

  const healthBreakdown = {
    'Savings Rate': { score: Math.min(100, savingsRate * 5) },
    'Budget Control': { score: monthlyExpenses < monthlyIncome ? 85 : 45 },
    'Expense Diversity': { score: categories.length > 5 ? 90 : 60 },
    'Financial Activity': { score: transactions.length > 50 ? 95 : 70 }
  };

  // Mock AI-powered quick actions
  const aiQuickActions = [
    {
      id: '1',
      title: 'Cancel Unused Subscriptions',
      description: 'You have 3 subscriptions you haven\'t used in 30 days',
      icon: 'alert',
      priority: 'high',
      savings: 47
    },
    {
      id: '2',
      title: 'Switch to High-Yield Savings',
      description: 'Move emergency fund to 4.5% APY account',
      icon: 'trending',
      priority: 'medium',
      savings: 125
    },
    {
      id: '3',
      title: 'Optimize Grocery Shopping',
      description: 'Your grocery spending is 23% above average',
      icon: 'wallet',
      priority: 'medium',
      savings: 85
    },
    {
      id: '4',
      title: 'Review Insurance Rates',
      description: 'You could save by bundling your policies',
      icon: 'save',
      priority: 'low',
      savings: 65
    }
  ];

  // Mock savings opportunities
  const savingsOpportunities = [
    {
      title: 'Refinance Auto Loan',
      description: 'Lower your rate from 6.5% to 4.2%',
      amount: 78
    },
    {
      title: 'Meal Prep Sundays',
      description: 'Reduce dining out by 40%',
      amount: 240
    },
    {
      title: 'Energy Efficient Appliances',
      description: 'Save on utility bills',
      amount: 45
    },
    {
      title: 'Cashback Credit Card',
      description: 'Earn 2% on all purchases',
      amount: 35
    }
  ];

  // Mock budget data
  const budgetData = [
    { category: 'Food & Dining', amount: 600 },
    { category: 'Transportation', amount: 400 },
    { category: 'Shopping', amount: 300 },
    { category: 'Entertainment', amount: 200 },
    { category: 'Bills & Utilities', amount: 800 }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionsData, trendsData, categoriesData] = await Promise.all([
          getTransactions(),
          getTrends(),
          getCategories()
        ]);
        
        setTransactions(transactionsData);
        setTrends(trendsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Your Financial Intelligence...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Intelligence Dashboard</h1>
        <p className="text-lg text-gray-600">Your complete financial overview with AI-powered insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monthly Income</span>
            <Icon name="trending" className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${monthlyIncome.toFixed(0)}</div>
          <div className="text-sm text-green-600 mt-2">+12% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monthly Expenses</span>
            <Icon name="wallet" className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${monthlyExpenses.toFixed(0)}</div>
          <div className="text-sm text-red-600 mt-2">+5% from last month</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Monthly Savings</span>
            <Icon name="save" className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${monthlySavings.toFixed(0)}</div>
          <div className="text-sm text-blue-600 mt-2">{savingsRate.toFixed(1)}% savings rate</div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Available Budget</span>
            <Icon name="target" className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900">${(monthlyIncome * 0.3).toFixed(0)}</div>
          <div className="text-sm text-purple-600 mt-2">30% of income</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Financial Health Score */}
        <div className="lg:col-span-1">
          <FinancialHealthScore score={financialHealthScore} breakdown={healthBreakdown} />
        </div>

        {/* Spending Distribution */}
        <div className="lg:col-span-1">
          <SpendingDistribution categories={categories} />
        </div>

        {/* AI Quick Actions */}
        <div className="lg:col-span-1">
          <AIQuickActions actions={aiQuickActions} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthComparison trends={trends} />
        <BudgetVsActual budgets={budgetData} actuals={categories} />
      </div>

      {/* Savings Opportunities */}
      <SavingsOpportunities opportunities={savingsOpportunities} />

      {/* Upload Section */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Import New Data</h3>
        <FileUpload onUploadSuccess={() => window.location.reload()} />
      </div>
    </div>
  );
};