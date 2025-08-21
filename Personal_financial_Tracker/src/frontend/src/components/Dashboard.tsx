import React, { useState, useEffect } from 'react';
import { FileUpload } from './FileUpload';
import { TransactionList } from './TransactionList';
import { SpendingChart } from './SpendingChart';
import { InsightsPanel } from './InsightsPanel';
import { getTransactions, getTrends, getCategories, getInsights } from '../services/api';
import type { Transaction, SpendingTrend, CategoryBreakdown, AIInsight } from '../types';

export const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<SpendingTrend[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'transactions' | 'analytics' | 'insights' | 'upload'>('overview');

  // Calculate current month metrics
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const currentTrend = trends.find(t => t.month === currentMonth) || trends[0];
  const totalBalance = currentTrend ? currentTrend.income - currentTrend.expenses : 0;
  const monthlyIncome = currentTrend?.income || 0;
  const monthlyExpenses = currentTrend?.expenses || 0;

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
      const insightsData = await getInsights({ timeRange: 'month' });
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

  // Navigation items with icons and descriptions
  const navItems = [
    { 
      id: 'overview', 
      name: 'Overview', 
      icon: '📊', 
      description: 'Financial dashboard and KPIs'
    },
    { 
      id: 'upload', 
      name: 'Import Data', 
      icon: '📁', 
      description: 'Upload bank statements'
    },
    { 
      id: 'transactions', 
      name: 'Transactions', 
      icon: '💳', 
      description: 'Transaction history and details'
    },
    { 
      id: 'analytics', 
      name: 'Analytics', 
      icon: '📈', 
      description: 'Spending trends and charts'
    },
    { 
      id: 'insights', 
      name: 'AI Insights', 
      icon: '🤖', 
      description: 'AI-powered recommendations'
    }
  ];

  if (loading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your financial dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Personal Finance Tracker</h1>
              <p className="text-slate-600 mt-1">Intelligent financial management and insights</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-slate-500">Current Balance</p>
                <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(totalBalance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">FT</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`relative py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeView === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </div>
                {activeView === item.id && (
                  <div className="absolute top-full left-0 mt-1 text-xs text-slate-500">
                    {item.description}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-600 mr-2">⚠️</span>
              <span className="text-red-700">{error}</span>
              <button
                onClick={loadData}
                className="ml-auto text-red-600 hover:text-red-700 underline text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Overview Dashboard */}
        {activeView === 'overview' && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Monthly Income</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${monthlyIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-green-600 text-lg">📈</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  Current month: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Monthly Expenses</p>
                    <p className="text-2xl font-bold text-red-600">
                      ${monthlyExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-red-600 text-lg">📉</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  {monthlyExpenses > 0 ? `${categories.length} categories` : 'No expenses recorded'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Net Cash Flow</p>
                    <p className={`text-2xl font-bold ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalBalance >= 0 ? '+' : ''}${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${totalBalance >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <span className={`text-lg ${totalBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {totalBalance >= 0 ? '💰' : '⚠️'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  {totalBalance >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 text-sm font-medium">Total Transactions</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {transactions.length.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📊</span>
                  </div>
                </div>
                <p className="text-slate-400 text-xs mt-2">
                  {transactions.length > 0 ? 'Data imported successfully' : 'Import data to get started'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveView('upload')}
                  className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl mr-3">📁</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">Import Data</p>
                    <p className="text-sm text-slate-500">Upload bank statements</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('analytics')}
                  className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl mr-3">📈</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">View Analytics</p>
                    <p className="text-sm text-slate-500">Spending trends & charts</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveView('insights')}
                  className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <span className="text-2xl mr-3">🤖</span>
                  <div className="text-left">
                    <p className="font-medium text-slate-900">AI Insights</p>
                    <p className="text-sm text-slate-500">Get recommendations</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Transactions Preview */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
                    <button
                      onClick={() => setActiveView('transactions')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      View all →
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-b-0">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-slate-600">
                              {transaction.amount < 0 ? '📤' : '📥'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{transaction.description}</p>
                            <p className="text-sm text-slate-500">
                              {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
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

        {/* Upload View */}
        {activeView === 'upload' && (
          <div className="bg-white rounded-xl shadow-sm p-8 border border-slate-200">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Import Financial Data</h2>
              <p className="text-slate-600 mt-2">Upload your bank statements to get started with financial analysis</p>
            </div>
            <FileUpload onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Transaction History</h2>
              <p className="text-slate-600 mt-2">Detailed view of all your financial transactions</p>
            </div>
            <TransactionList transactions={transactions} />
          </div>
        )}

        {/* Analytics View */}
        {activeView === 'analytics' && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Financial Analytics</h2>
              <p className="text-slate-600">Comprehensive analysis of your spending patterns and trends</p>
            </div>
            <SpendingChart trends={trends} categories={categories} />
          </div>
        )}

        {/* Insights View */}
        {activeView === 'insights' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">AI-Powered Insights</h2>
              <p className="text-slate-600 mt-2">Personalized recommendations and financial advice</p>
            </div>
            <div className="p-6">
              <InsightsPanel insights={insights} onRefresh={handleRefreshInsights} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};