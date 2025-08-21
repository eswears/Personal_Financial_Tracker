import React from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart } from 'recharts';
import type { SpendingTrend, CategoryBreakdown } from '../types';

interface SpendingChartProps {
  trends: SpendingTrend[];
  categories: CategoryBreakdown[];
}

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#EF4444', '#6B7280', '#8DD1E1', '#D084A1', '#FF9999'];

export const SpendingChart: React.FC<SpendingChartProps> = ({ trends, categories }) => {
  const monthlyData = trends.map(t => ({
    month: new Date(`${t.month}-01`).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    fullMonth: new Date(`${t.month}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    income: t.income,
    expenses: Math.abs(t.expenses),
    net: t.net
  })).reverse(); // Show chronologically

  const totalAmount = categories.reduce((sum, cat) => sum + (cat.amount || 0), 0);
  
  const categoryData = categories.map((cat, index) => ({
    ...cat,
    color: COLORS[index % COLORS.length],
    percentage: totalAmount > 0 ? ((cat.amount || 0) / totalAmount) * 100 : 0
  }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{payload[0]?.payload?.fullMonth || label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              <span className="font-medium">{entry.name}:</span> {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 capitalize">{data.category}</p>
          <p className="text-sm text-slate-600">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full space-y-8">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.income, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-green-600 text-xl">💰</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2">Last {monthlyData.length} months</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.expenses, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-red-600 text-xl">💸</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2">Last {monthlyData.length} months</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-medium">Net Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(monthlyData.reduce((sum, month) => sum + month.net, 0))}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
          </div>
          <p className="text-slate-400 text-xs mt-2">Last {monthlyData.length} months</p>
        </div>
      </div>

      {/* Monthly Trends Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Monthly Overview</h3>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span className="text-slate-600">Income</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span className="text-slate-600">Expenses</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-slate-600">Balance</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="income" fill="#10B981" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#EF4444" name="Expenses" radius={[4, 4, 0, 0]} />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Balance"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart for Net Flow */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Cash Flow Trend</h3>
            <div className="text-sm text-slate-500">Net income over time</div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="net" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
                name="Net Cash Flow"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Spending by Category</h3>
          <div className="text-sm text-slate-500">
            {categories.length} categories • {formatCurrency(categories.reduce((sum, cat) => sum + cat.amount, 0))} total
          </div>
        </div>
        
        {categories.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="flex justify-center">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="amount"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900 mb-4">Category Breakdown</h4>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {categoryData
                  .sort((a, b) => b.amount - a.amount)
                  .map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: cat.color }}
                        />
                        <div>
                          <p className="font-medium text-slate-900 capitalize">{cat.category}</p>
                          <p className="text-xs text-slate-500">{(cat.percentage || 0).toFixed(1)}% of total spending</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{formatCurrency(cat.amount)}</p>
                        <p className="text-xs text-slate-500">{cat.transactionCount || 0} transactions</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-slate-400 text-2xl">📊</span>
            </div>
            <p className="text-slate-500">No spending data available</p>
            <p className="text-slate-400 text-sm">Upload bank statements to see category breakdown</p>
          </div>
        )}
      </div>
    </div>
  );
};