import React, { useState, useEffect } from 'react';
import { PieChart, Pie, BarChart, Bar, LineChart, Line, AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FileUpload } from './FileUpload';
import { EnhancedTransactionList } from './EnhancedTransactionList';
import { FinancialForecast } from './FinancialForecast';
import { AIAssistant } from './AIAssistant';
import { getTransactions, getTrends, getCategories, getInsights } from '../services/api';
import type { Transaction, SpendingTrend, CategoryBreakdown, AIInsight } from '../types';

// Icon Component
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const icons: { [key: string]: JSX.Element } = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    transactions: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    analytics: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    forecast: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    budget: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    insights: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    upload: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
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
    save: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
      </svg>
    )
  };
  
  return icons[name] || null;
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  onClick?: () => void;
  clickable?: boolean;
}> = ({ title, value, change, changeType = 'neutral', icon, onClick, clickable = false }) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all duration-200 ${
        clickable ? 'cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-300' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm mt-2 ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          changeType === 'positive' ? 'bg-green-100 text-green-600' :
          changeType === 'negative' ? 'bg-red-100 text-red-600' :
          'bg-blue-100 text-blue-600'
        }`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
      </div>
      {clickable && (
        <div className="mt-4 text-xs text-blue-600 flex items-center">
          View details <span className="ml-1">→</span>
        </div>
      )}
    </div>
  );
};

// Spending Pie Chart
const SpendingPieChart: React.FC<{ categories: CategoryBreakdown[]; onCategoryClick: (category: string) => void }> = ({ categories, onCategoryClick }) => {
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  
  const data = categories.length > 0 ? categories : [
    { category: 'No Data', amount: 1, color: '#E5E7EB' }
  ];

  const pieData = data.map((cat, index) => ({
    name: cat.category,
    value: cat.amount,
    color: cat.color || COLORS[index % COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      const total = data.reduce((sum, cat) => sum + cat.amount, 0);
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-medium">{payload[0].name}</p>
          <p className="text-lg font-bold" style={{ color: payload[0].payload.color }}>
            ${payload[0].value.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">
            {((payload[0].value / total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">Spending Distribution</h3>
        <button 
          onClick={() => onCategoryClick('all')}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all categories →
        </button>
      </div>
      {categories.length > 0 ? (
        <div className="flex items-center">
          <div className="w-64 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onCategoryClick(entry.name)}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 ml-6">
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {data.slice(0, 8).map((item) => (
                <div 
                  key={item.category} 
                  className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                  onClick={() => onCategoryClick(item.category)}
                >
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: item.color || COLORS[data.indexOf(item) % COLORS.length] }} 
                    />
                    <span className="text-sm text-gray-700">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    ${item.amount.toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No spending data available</p>
          <button 
            onClick={() => onCategoryClick('upload')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Upload transactions to see distribution
          </button>
        </div>
      )}
    </div>
  );
};

export const FinalDashboard: React.FC = () => {
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'analytics' | 'budget' | 'insights' | 'forecast' | 'upload' | 'settings'>('overview');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate metrics
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentTrend = trends.find(t => t.month === currentMonth) || trends[0];
  const monthlyIncome = currentTrend?.income || 0;
  const monthlyExpenses = currentTrend?.expenses || 0;
  const monthlySavings = monthlyIncome - monthlyExpenses;

  // Navigation items
  const navItems = [
    { id: 'overview', name: 'Overview', icon: 'dashboard', description: 'Dashboard summary' },
    { id: 'transactions', name: 'Transactions', icon: 'transactions', description: 'All transactions', count: transactions.length },
    { id: 'analytics', name: 'Analytics', icon: 'analytics', description: 'Detailed analysis' },
    { id: 'forecast', name: 'Forecast', icon: 'forecast', description: 'Financial projections' },
    { id: 'budget', name: 'Budget', icon: 'budget', description: 'Budget planning' },
    { id: 'insights', name: 'AI Insights', icon: 'insights', description: 'Smart recommendations' },
    { id: 'upload', name: 'Import', icon: 'upload', description: 'Upload data' },
    { id: 'settings', name: 'Settings', icon: 'settings', description: 'Preferences' }
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

  const handleCategoryClick = (category: string) => {
    if (category === 'all') {
      setActiveView('analytics');
    } else if (category === 'upload') {
      setActiveView('upload');
    } else {
      setSelectedCategory(category);
      setActiveView('transactions');
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view as any);
  };

  const filteredTransactions = selectedCategory
    ? transactions.filter(t => t.category === selectedCategory)
    : searchQuery
    ? transactions.filter(t => 
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar Navigation - Fixed */}
      <aside className="w-64 bg-white shadow-lg fixed left-0 top-0 h-full z-40">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">FinanceTracker</h1>
          <p className="text-sm text-gray-600 mt-1">AI-Powered Budget Manager</p>
        </div>
        
        <nav className="p-4 pb-32">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as any);
                setSelectedCategory(null);
              }}
              className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-all ${
                activeView === item.id
                  ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon name={item.icon} className="w-5 h-5 mr-3" />
              <span className="flex-1 text-left">{item.name}</span>
              {item.count && (
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Fixed Bottom Balance Panel */}
      <div className="fixed bottom-0 left-0 w-64 p-4 bg-white border-t shadow-lg z-50">
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">Current Balance</p>
          <p className="text-2xl font-bold">
            ${monthlySavings >= 0 ? '+' : ''}{monthlySavings.toFixed(2)}
          </p>
          <p className="text-xs opacity-75 mt-1">
            {((monthlySavings / monthlyIncome) * 100).toFixed(1)}% savings rate
          </p>
        </div>
      </div>

      {/* Main Content - Adjusted for sidebar */}
      <main className="flex-1 ml-64 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">
              {navItems.find(item => item.id === activeView)?.name}
            </h2>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="p-2 rounded-lg hover:bg-gray-100">
                <Icon name="settings" className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {/* Overview Page */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Monthly Income"
                  value={`$${monthlyIncome.toFixed(2)}`}
                  change="+12% from last month"
                  changeType="positive"
                  icon="trending"
                  clickable
                  onClick={() => setActiveView('analytics')}
                />
                <MetricCard
                  title="Monthly Expenses"
                  value={`$${monthlyExpenses.toFixed(2)}`}
                  change="-3% from last month"
                  changeType="positive"
                  icon="wallet"
                  clickable
                  onClick={() => setActiveView('transactions')}
                />
                <MetricCard
                  title="Total Savings"
                  value={`$${monthlySavings.toFixed(2)}`}
                  change={monthlySavings >= 0 ? "On track" : "Over budget"}
                  changeType={monthlySavings >= 0 ? "positive" : "negative"}
                  icon="save"
                  clickable
                  onClick={() => setActiveView('forecast')}
                />
                <MetricCard
                  title="Transactions"
                  value={transactions.length.toString()}
                  change="This month"
                  changeType="neutral"
                  icon="transactions"
                  clickable
                  onClick={() => setActiveView('transactions')}
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingPieChart categories={categories} onCategoryClick={handleCategoryClick} />
                <div className="bg-gradient-to-br from-purple-50 to-indigo-100 rounded-xl shadow-sm border border-purple-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Quick Actions</h3>
                  <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-700">💡 You could save $240/month by reducing dining out</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-700">📈 Consider investing your surplus $500/month</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <p className="text-sm text-gray-700">🎯 Your emergency fund needs $2,000 more</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveView('insights')}
                    className="mt-4 w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                  >
                    View All AI Insights
                  </button>
                </div>
              </div>

              {/* Trends Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Income vs Expenses Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="income" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="expenses" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                  <button 
                    onClick={() => setActiveView('transactions')}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div 
                      key={transaction.id} 
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                      onClick={() => setActiveView('transactions')}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                          transaction.amount < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <Icon name={transaction.amount < 0 ? 'wallet' : 'trending'} className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                          </p>
                        </div>
                      </div>
                      <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transactions Page with Enhanced List */}
          {activeView === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              {selectedCategory && (
                <div className="p-4 bg-blue-50 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-blue-800">
                      Filtering by category: <span className="font-semibold">{selectedCategory}</span>
                    </p>
                    <button 
                      onClick={() => setSelectedCategory(null)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Clear filter ×
                    </button>
                  </div>
                </div>
              )}
              <EnhancedTransactionList 
                transactions={filteredTransactions} 
                initialBalance={10000} // Mock starting balance
              />
            </div>
          )}

          {/* Analytics Page */}
          {activeView === 'analytics' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SpendingPieChart categories={categories} onCategoryClick={handleCategoryClick} />
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Top Spending Categories</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={categories.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Monthly Trends</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
                    <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Financial Forecast Page */}
          {activeView === 'forecast' && (
            <FinancialForecast 
              transactions={transactions}
              trends={trends}
              monthlyIncome={monthlyIncome}
              monthlyExpenses={monthlyExpenses}
            />
          )}

          {/* Budget Page */}
          {activeView === 'budget' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Budget Overview</h3>
                <div className="space-y-4">
                  {categories.map((cat) => {
                    const budget = monthlyIncome * 0.15; // Mock budget allocation
                    const percentage = (cat.amount / budget) * 100;
                    return (
                      <div key={cat.category}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">{cat.category}</span>
                          <span className="text-sm text-gray-600">
                            ${cat.amount.toFixed(0)} / ${budget.toFixed(0)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              percentage > 100 ? 'bg-red-500' : 
                              percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Insights Page */}
          {activeView === 'insights' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-8 text-white">
                <h2 className="text-3xl font-bold mb-4">AI-Powered Financial Insights</h2>
                <p className="text-lg opacity-90">Personalized recommendations based on your spending patterns</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { title: 'Reduce Dining Expenses', savings: '$240/mo', action: 'Create meal plan' },
                  { title: 'Cancel Unused Subscriptions', savings: '$47/mo', action: 'Review subscriptions' },
                  { title: 'Switch to High-Yield Savings', savings: '$125/mo', action: 'Compare rates' },
                  { title: 'Optimize Transportation', savings: '$85/mo', action: 'Use public transit' }
                ].map((insight, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                    <p className="text-2xl font-bold text-green-600 mb-4">{insight.savings}</p>
                    <button 
                      onClick={() => setActiveView('forecast')}
                      className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      {insight.action}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload Page */}
          {activeView === 'upload' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <FileUpload onUploadSuccess={() => window.location.reload()} />
            </div>
          )}

          {/* Settings Page */}
          {activeView === 'settings' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Settings</h3>
              <p className="text-gray-600">Settings page coming soon...</p>
            </div>
          )}
        </div>
      </main>

      {/* AI Assistant */}
      <AIAssistant 
        transactions={transactions}
        trends={trends}
        categories={categories}
        monthlyIncome={monthlyIncome}
        monthlyExpenses={monthlyExpenses}
        onNavigate={handleNavigate}
      />

      {/* Dynamo.AI Footer */}
      <footer className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200">
          <span className="text-sm text-gray-600">Powered by</span>
          <img 
            src="/dynamo_dai_icon.jpg" 
            alt="Dynamo.AI" 
            className="w-6 h-6 rounded-md"
          />
          <span className="text-sm font-medium text-gray-800">Dynamo.AI</span>
        </div>
      </footer>
    </div>
  );
};