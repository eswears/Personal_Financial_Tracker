import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { TransactionList } from './TransactionList';
import { SpendingChart } from './SpendingChart';
import { InsightsPanel } from './InsightsPanel';
import { getTransactions, getTrends, getCategories, getInsights } from '../services/api';
import type { Transaction, SpendingTrend, CategoryBreakdown, AIInsight } from '../types';

// Advanced Enterprise Icons Component
const Icon: React.FC<{ name: string; className?: string }> = ({ name, className = "w-5 h-5" }) => {
  const icons = {
    dashboard: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
      </svg>
    ),
    upload: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
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
    insights: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    user: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    settings: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bell: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    search: (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  };
  
  return icons[name as keyof typeof icons] || null;
};

// Enterprise Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  trend?: number[];
}> = ({ title, value, change, changeType = 'neutral', icon, trend }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-base font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-3">{value}</p>
          {change && (
            <div className={`flex items-center text-base font-medium ${
              changeType === 'positive' ? 'text-green-600' : 
              changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              <span>{change}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-xl transition-colors duration-200 ${
          changeType === 'positive' ? 'bg-green-50 text-green-600 group-hover:bg-green-100' :
          changeType === 'negative' ? 'bg-red-50 text-red-600 group-hover:bg-red-100' :
          'bg-blue-50 text-blue-600 group-hover:bg-blue-100'
        }`}>
          <Icon name={icon} className="w-7 h-7" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 h-10">
          <svg className="w-full h-full" viewBox="0 0 100 20">
            <polyline
              fill="none"
              stroke={changeType === 'positive' ? '#10b981' : changeType === 'negative' ? '#ef4444' : '#6b7280'}
              strokeWidth="2"
              points={trend.map((val, i) => `${i * (100 / (trend.length - 1))},${20 - (val * 20)}`).join(' ')}
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export const EnterpriseDashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'analytics' | 'insights' | 'upload'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');

  // Calculate metrics
  const currentMonth = new Date().toISOString().slice(0, 7);
  const currentTrend = Array.isArray(trends) ? (trends.find(t => t.month === currentMonth) || trends[0]) : null;
  const totalBalance = currentTrend ? currentTrend.income - currentTrend.expenses : 0;
  const monthlyIncome = currentTrend?.income || 0;
  const monthlyExpenses = currentTrend?.expenses || 0;
  
  // Mock trend data for sparklines
  const incomeTrend = [0.3, 0.7, 0.4, 0.8, 0.6, 0.9, 0.7];
  const expenseTrend = [0.6, 0.4, 0.8, 0.3, 0.7, 0.5, 0.8];
  const balanceTrend = totalBalance >= 0 ? [0.4, 0.6, 0.3, 0.8, 0.5, 0.9, 0.7] : [0.8, 0.6, 0.9, 0.4, 0.7, 0.3, 0.5];

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [transactionsData, trendsData, categoriesData] = await Promise.all([
        getTransactions(),
        getTrends(),
        getCategories()
      ]);
      
      setTransactions(transactionsData);
      setTrends(trendsData);
      setCategories(categoriesData);
    } catch (err: any) {
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      const insightsData = await getInsights({ timeRange });
      setInsights(insightsData);
    } catch (err) {
      console.error('Failed to load insights:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUploadSuccess = () => {
    loadData();
  };

  const handleRefreshInsights = () => {
    loadInsights();
  };

  // Advanced navigation configuration
  const navItems = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: 'dashboard',
      description: 'Financial dashboard and KPIs',
      badge: null
    },
    { 
      id: 'upload', 
      name: 'Import Data', 
      icon: 'upload',
      description: 'Upload bank statements',
      badge: null
    },
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: 'transactions',
      description: 'Transaction history and details',
      badge: transactions.length > 0 ? transactions.length.toString() : null
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: 'analytics',
      description: 'Spending trends and charts',
      badge: null
    },
    { 
      id: 'insights', 
      name: 'AI Insights', 
      icon: 'insights',
      description: 'AI-powered recommendations',
      badge: insights ? '1' : null
    }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-ping mx-auto"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Financial Dashboard</h2>
          <p className="text-gray-600">Preparing your enterprise analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white/80 backdrop-blur-lg border-r border-gray-200 flex flex-col">
        {/* Logo & Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
              <Icon name="dashboard" className="w-7 h-7 text-white" />
            </div>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">FinanceTracker Pro</h1>
              <p className="text-sm text-gray-600">Enterprise Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center px-4 py-4 text-base font-medium rounded-lg transition-all duration-200 group ${
                  activeView === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-500'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon name={item.icon} className="w-6 h-6 mr-4" />
                <span className="flex-1 text-left">{item.name}</span>
                {item.badge && (
                  <span className={`ml-2 px-2 py-1 text-sm rounded-full font-medium ${
                    activeView === item.id 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile */}
        <div className="p-5 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center">
              <Icon name="user" className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4 flex-1">
              <p className="text-base font-medium text-gray-900">Current Balance</p>
              <p className={`text-xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalBalance >= 0 ? '+' : ''}${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 capitalize">
                  {activeView === 'overview' ? 'Dashboard Overview' : 
                   activeView === 'upload' ? 'Data Import' :
                   activeView === 'transactions' ? 'Transaction History' :
                   activeView === 'analytics' ? 'Financial Analytics' :
                   'AI Insights'}
                </h2>
                <p className="text-lg text-gray-600 mt-2">
                  {activeView === 'overview' ? 'Complete financial overview and key metrics' :
                   activeView === 'upload' ? 'Import bank statements and financial data' :
                   activeView === 'transactions' ? 'Detailed transaction history and management' :
                   activeView === 'analytics' ? 'Advanced spending analysis and trends' :
                   'AI-powered insights and recommendations'}
                </p>
              </div>

              {/* Search & Actions */}
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-72 pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  />
                  <Icon name="search" className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                </div>
                
                <button className="relative p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                  <Icon name="bell" className="w-6 h-6" />
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                </button>
                
                <button className="p-3 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                  <Icon name="settings" className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button
                onClick={loadData}
                className="ml-4 text-red-600 hover:text-red-800 text-sm font-medium underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

          {/* Overview Dashboard */}
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Time Range Selector */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <select 
                    value={timeRange} 
                    onChange={(e) => setTimeRange(e.target.value as any)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="month">Last Month</option>
                    <option value="quarter">Last Quarter</option>
                    <option value="year">Last Year</option>
                  </select>
                </div>
              </div>

              {/* Enterprise KPI Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Monthly Income"
                value={`$${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                change="+12.5% from last month"
                changeType="positive"
                icon="analytics"
                trend={incomeTrend}
              />
              <MetricCard
                title="Monthly Expenses"
                value={`$${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                change="-3.2% from last month"
                changeType="positive"
                icon="transactions"
                trend={expenseTrend}
              />
              <MetricCard
                title="Net Cash Flow"
                value={`${totalBalance >= 0 ? '+' : ''}$${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                change={totalBalance >= 0 ? "+8.7% improved" : "-15.2% declined"}
                changeType={totalBalance >= 0 ? "positive" : "negative"}
                icon="dashboard"
                trend={balanceTrend}
              />
              <MetricCard
                title="Total Transactions"
                value={transactions.length.toLocaleString()}
                change={`${transactions.length} this ${timeRange}`}
                changeType="neutral"
                icon="insights"
              />
            </div>

              {/* Quick Actions Enterprise Style */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { view: 'upload', title: 'Import Financial Data', desc: 'Upload bank statements and CSV files', icon: 'upload', color: 'blue' },
                  { view: 'analytics', title: 'Advanced Analytics', desc: 'Detailed spending analysis and trends', icon: 'analytics', color: 'purple' },
                  { view: 'insights', title: 'AI Insights', desc: 'Personalized recommendations and forecasts', icon: 'insights', color: 'green' }
                ].map((action) => (
                  <button
                    key={action.view}
                    onClick={() => setActiveView(action.view as any)}
                    className={`flex items-start p-6 border border-gray-200 rounded-xl hover:shadow-md transition-all duration-200 text-left group hover:border-${action.color}-300`}
                  >
                    <div className={`p-3 rounded-lg bg-${action.color}-50 text-${action.color}-600 group-hover:bg-${action.color}-100 mr-4`}>
                      <Icon name={action.icon} className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h4>
                      <p className="text-base text-gray-600">{action.desc}</p>
                    </div>
                  </button>
                ))}
                </div>
              </div>

            {/* Recent Transactions Preview - Enhanced */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveView('transactions')}
                      className="text-blue-600 hover:text-blue-700 text-base font-medium hover:underline"
                    >
                      View all {transactions.length} transactions →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-lg px-4 -mx-4 transition-colors">
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-4 ${
                            transaction.amount < 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                          }`}>
                            <Icon name={transaction.amount < 0 ? 'transactions' : 'analytics'} className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-lg font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-base text-gray-500">
                              {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* Other Views */}
          {activeView === 'upload' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <FileUpload onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {activeView === 'transactions' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <TransactionList transactions={transactions} />
            </div>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <SpendingChart trends={trends} categories={categories} />
            </div>
          )}

          {activeView === 'insights' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6">
                <InsightsPanel insights={insights} onRefresh={handleRefreshInsights} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};