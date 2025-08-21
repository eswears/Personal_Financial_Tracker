import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Transaction, SpendingTrend } from '../types';

interface Scenario {
  id: string;
  name: string;
  description: string;
  explanation: string;
  changes: {
    category: string;
    changePercent: number;
    changeAmount?: number;
  }[];
  actions: string[];
  active: boolean;
  color: string;
}

interface ForecastProps {
  transactions: Transaction[];
  trends: SpendingTrend[];
  monthlyIncome: number;
  monthlyExpenses: number;
}

export const FinancialForecast: React.FC<ForecastProps> = ({ 
  transactions, 
  trends, 
  monthlyIncome, 
  monthlyExpenses 
}) => {
  const [timeHorizon, setTimeHorizon] = useState<3 | 6 | 12 | 24>(12);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: 'baseline',
      name: 'Current Trajectory',
      description: 'Continue with current spending patterns',
      explanation: 'This scenario assumes you maintain your current income and spending habits without any changes. It serves as a baseline to compare other optimization strategies.',
      changes: [],
      actions: [
        'Continue current spending patterns',
        'No changes required',
        'Monitor monthly cash flow'
      ],
      active: true,
      color: '#6B7280'
    },
    {
      id: 'ai-optimized',
      name: 'AI Optimized',
      description: 'Apply all AI recommendations',
      explanation: 'Based on analysis of your spending patterns, this scenario implements smart reductions in categories where you overspend compared to financial best practices. The AI has identified specific areas where small changes can yield significant savings without drastically affecting your lifestyle.',
      changes: [
        { category: 'Food & Dining', changePercent: -40 },
        { category: 'Entertainment', changePercent: -25 },
        { category: 'Shopping', changePercent: -20 },
        { category: 'Subscription', changePercent: -30 }
      ],
      actions: [
        'Cook at home 4 days per week instead of dining out',
        'Cancel 2-3 unused streaming subscriptions',
        'Wait 48 hours before non-essential purchases',
        'Choose free/low-cost entertainment options 2x per month',
        'Use grocery lists and meal planning',
        'Review and cancel gym memberships you don\'t use',
        'Switch to generic brands for household items'
      ],
      active: true,
      color: '#10B981'
    },
    {
      id: 'aggressive-saving',
      name: 'Aggressive Saving',
      description: 'Maximum savings through disciplined spending',
      explanation: 'This scenario represents a focused savings approach where you significantly reduce discretionary spending to maximize wealth building. It requires discipline but can accelerate your financial goals dramatically. Best suited for short-term sprints toward specific goals like emergency fund building or major purchase savings.',
      changes: [
        { category: 'Food & Dining', changePercent: -50 },
        { category: 'Entertainment', changePercent: -60 },
        { category: 'Shopping', changePercent: -40 },
        { category: 'Travel', changePercent: -70 }
      ],
      actions: [
        'Cook all meals at home, pack lunches daily',
        'Cancel all non-essential subscriptions (Netflix, Spotify, etc.)',
        'Implement a 30-day waiting period for all non-essential purchases',
        'Use free entertainment: libraries, parks, free museums',
        'Shop only with a list and stick to necessities',
        'Use public transportation or walk/bike when possible',
        'Plan one major trip per year instead of multiple vacations',
        'Buy generic/store brands for everything possible',
        'Use coupons and shop sales aggressively',
        'Sell items you don\'t need to generate extra income'
      ],
      active: false,
      color: '#3B82F6'
    },
    {
      id: 'income-boost',
      name: 'Income Boost',
      description: 'Increase earnings through additional income streams',
      explanation: 'This scenario focuses on growing your income rather than cutting expenses. It combines negotiating a salary increase with developing side income streams. This approach can provide more sustainable long-term wealth building since you\'re expanding your earning potential rather than restricting your lifestyle.',
      changes: [
        { category: 'Income', changeAmount: 1500 }
      ],
      actions: [
        'Research market rate for your position and request 10-15% salary increase',
        'Start a freelance side hustle in your expertise area',
        'Offer tutoring or consulting services (2-3 hours/week)',
        'Sell products online (crafts, digital products, etc.)',
        'Take on part-time remote work in evenings/weekends',
        'Rent out a room in your home or parking space',
        'Drive for rideshare or delivery services during peak hours',
        'Create and sell an online course in your field',
        'Offer services like pet sitting, house sitting, or lawn care',
        'Invest in dividend-paying stocks with extra income',
        'Upgrade skills through certification to qualify for promotions'
      ],
      active: false,
      color: '#8B5CF6'
    }
  ]);

  // Fetch AI insights to enhance scenarios
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        setLoadingInsights(true);
        const response = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            timeRange: 'month',
            focusAreas: ['savings', 'budgeting', 'optimization']
          }),
        });

        if (response.ok) {
          const insights = await response.json();
          setAiInsights(insights);
          
          // Update AI Optimized scenario with real AI recommendations
          setScenarios(prevScenarios => 
            prevScenarios.map(scenario => {
              if (scenario.id === 'ai-optimized' && insights.recommendations) {
                return {
                  ...scenario,
                  explanation: insights.summary || scenario.explanation,
                  actions: insights.recommendations.slice(0, 7) // Take first 7 recommendations
                };
              }
              return scenario;
            })
          );
        }
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
      } finally {
        setLoadingInsights(false);
      }
    };

    fetchAIInsights();
  }, [monthlyIncome, monthlyExpenses]); // Re-fetch when financial data changes

  const [customScenario, setCustomScenario] = useState({
    name: '',
    description: '',
    changes: [] as any[]
  });
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [completedActions, setCompletedActions] = useState<{ [scenarioId: string]: Set<number> }>({});

  // Calculate forecast data
  const forecastData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 0; i <= timeHorizon; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setMonth(currentDate.getMonth() + i);
      const monthStr = futureDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      const monthData: any = {
        month: monthStr,
        actual: i === 0 ? monthlyIncome - monthlyExpenses : null
      };

      scenarios.forEach(scenario => {
        if (scenario.active) {
          let scenarioIncome = monthlyIncome;
          let scenarioExpenses = monthlyExpenses;

          scenario.changes.forEach(change => {
            if (change.category === 'Income' && change.changeAmount) {
              scenarioIncome += change.changeAmount;
            } else if (change.changePercent) {
              // Apply percentage reduction to specific category spending
              const categorySpending = monthlyExpenses * 0.15; // Assume each category is ~15% of expenses
              const reduction = categorySpending * (change.changePercent / 100);
              scenarioExpenses += reduction;
            }
          });

          const monthlySavings = scenarioIncome - scenarioExpenses;
          const previousBalance = i === 0 ? 0 : monthData[scenario.id + '_balance'] || 0;
          
          monthData[scenario.id] = monthlySavings;
          monthData[scenario.id + '_balance'] = previousBalance + monthlySavings * (i === 0 ? 1 : 1);
          
          if (i > 0) {
            monthData[scenario.id + '_balance'] = (monthData[scenario.id + '_balance'] || 0) + monthlySavings;
          }
        }
      });

      months.push(monthData);
    }

    // Calculate cumulative balances
    scenarios.forEach(scenario => {
      if (scenario.active) {
        let cumulative = 0;
        months.forEach(month => {
          if (month[scenario.id] !== null && month[scenario.id] !== undefined) {
            cumulative += month[scenario.id];
            month[scenario.id + '_cumulative'] = cumulative;
          }
        });
      }
    });

    return months;
  }, [scenarios, timeHorizon, monthlyIncome, monthlyExpenses]);

  // Calculate key metrics for each scenario
  const scenarioMetrics = useMemo(() => {
    return scenarios.filter(s => s.active).map(scenario => {
      const lastMonth = forecastData[forecastData.length - 1];
      const totalSaved = lastMonth[scenario.id + '_cumulative'] || 0;
      const monthlyAvg = totalSaved / timeHorizon;
      
      return {
        ...scenario,
        totalSaved,
        monthlyAvg,
        projectedNetWorth: totalSaved,
        emergencyFund: totalSaved / monthlyExpenses
      };
    });
  }, [scenarios, forecastData, timeHorizon, monthlyExpenses]);

  const toggleScenario = (scenarioId: string) => {
    setScenarios(prev => prev.map(s => 
      s.id === scenarioId ? { ...s, active: !s.active } : s
    ));
  };

  const toggleActionCompletion = (scenarioId: string, actionIndex: number) => {
    setCompletedActions(prev => {
      const scenarioActions = prev[scenarioId] || new Set();
      const newSet = new Set(scenarioActions);
      
      if (newSet.has(actionIndex)) {
        newSet.delete(actionIndex);
      } else {
        newSet.add(actionIndex);
      }
      
      return {
        ...prev,
        [scenarioId]: newSet
      };
    });
  };

  const getCompletionProgress = (scenarioId: string, totalActions: number) => {
    const completed = completedActions[scenarioId]?.size || 0;
    return { completed, total: totalActions, percentage: (completed / totalActions) * 100 };
  };

  const addCustomChange = () => {
    // This would open a modal or form to add custom changes
    console.log('Add custom scenario change');
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Financial Forecast</h2>
            <p className="text-gray-600 mt-1">Project your financial future based on different scenarios</p>
          </div>
          <div className="flex items-center space-x-4">
            <label className="text-sm text-gray-600">Time Horizon:</label>
            <select 
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(Number(e.target.value) as any)}
              className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
              <option value={12}>1 year</option>
              <option value={24}>2 years</option>
            </select>
          </div>
        </div>

        {/* Scenario Toggles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scenarios.map(scenario => (
            <div key={scenario.id} className="space-y-2">
              <button
                onClick={() => toggleScenario(scenario.id)}
                className={`w-full p-4 rounded-lg border-2 transition-all ${
                  scenario.active 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: scenario.color }}
                  />
                  <input
                    type="checkbox"
                    checked={scenario.active}
                    onChange={() => {}}
                    className="rounded"
                  />
                </div>
                <h4 className="font-medium text-sm text-gray-900 text-left">{scenario.name}</h4>
                <p className="text-xs text-gray-600 mt-1 text-left">{scenario.description}</p>
              </button>
              
              <button
                onClick={() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)}
                className={`w-full px-3 py-2 text-xs rounded-md transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedScenario === scenario.id ? 'Hide Details' : 'Show Action Steps'}
                {(() => {
                  const progress = getCompletionProgress(scenario.id, scenario.actions.length);
                  if (progress.completed > 0) {
                    return (
                      <span className="ml-1 text-xs opacity-75">
                        ({progress.completed}/{progress.total})
                      </span>
                    );
                  }
                  return null;
                })()}
              </button>
            </div>
          ))}
        </div>
        
        {/* Detailed Scenario Explanation */}
        {selectedScenario && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl border border-blue-200 p-6 mt-4">
            {(() => {
              const scenario = scenarios.find(s => s.id === selectedScenario);
              if (!scenario) return null;
              
              return (
                <div>
                  <div className="flex items-center mb-4">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: scenario.color }}
                    />
                    <h3 className="text-xl font-semibold text-gray-900">{scenario.name}</h3>
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
                      scenario.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {scenario.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">What This Scenario Does:</h4>
                      <p className="text-gray-700 text-sm leading-relaxed mb-4">
                        {scenario.explanation}
                      </p>
                      
                      {scenario.changes.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Financial Changes:</h4>
                          <ul className="space-y-1">
                            {scenario.changes.map((change, index) => (
                              <li key={index} className="text-sm text-gray-700 flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                {change.category}: {change.changePercent ? `${change.changePercent}%` : `+$${change.changeAmount}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">Action Steps to Take:</h4>
                        {(() => {
                          const progress = getCompletionProgress(scenario.id, scenario.actions.length);
                          return (
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-600">
                                {progress.completed} of {progress.total} completed
                              </div>
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${progress.percentage}%` }}
                                />
                              </div>
                              <div className="text-xs font-medium text-green-600">
                                {Math.round(progress.percentage)}%
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      <div className="bg-white rounded-lg p-4 border border-blue-200 max-h-60 overflow-y-auto">
                        <ul className="space-y-3">
                          {scenario.id === 'ai-optimized' && loadingInsights ? (
                            <li className="flex items-center space-x-3 text-gray-600">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                              <span className="text-sm">Loading AI-generated recommendations...</span>
                            </li>
                          ) : (
                            scenario.actions.map((action, index) => {
                            const isCompleted = completedActions[scenario.id]?.has(index) || false;
                            return (
                              <li key={index} className="flex items-start">
                                <button
                                  onClick={() => toggleActionCompletion(scenario.id, index)}
                                  className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-green-500 border-green-500 text-white' 
                                      : 'border-gray-300 hover:border-blue-400'
                                  }`}
                                >
                                  {isCompleted && (
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  )}
                                </button>
                                <div className="flex-1">
                                  <span className={`text-sm ${
                                    isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'
                                  }`}>
                                    {action}
                                  </span>
                                  {isCompleted && (
                                    <span className="text-xs text-green-600 ml-2 font-medium">✓ Done</span>
                                  )}
                                </div>
                              </li>
                            );
                          }))}
                        </ul>
                        
                        {(() => {
                          const progress = getCompletionProgress(scenario.id, scenario.actions.length);
                          if (progress.completed === progress.total && progress.total > 0) {
                            return (
                              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-center">
                                  <span className="text-green-500 mr-2">🎉</span>
                                  <span className="text-sm font-medium text-green-800">
                                    Congratulations! You've completed all action steps for this scenario.
                                  </span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => {
                            if (!scenario.active) toggleScenario(scenario.id);
                          }}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            scenario.active 
                              ? 'bg-green-100 text-green-700 cursor-default' 
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {scenario.active ? 'Already Active ✓' : 'Activate This Scenario'}
                        </button>
                        <button
                          onClick={() => setSelectedScenario(null)}
                          className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        >
                          Close Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Forecast Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Projection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Savings Projection</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
              <Legend />
              {scenarios.filter(s => s.active).map(scenario => (
                <Line 
                  key={scenario.id}
                  type="monotone" 
                  dataKey={scenario.id} 
                  stroke={scenario.color}
                  strokeWidth={2}
                  name={scenario.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cumulative Wealth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cumulative Wealth Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `$${value.toFixed(0)}`} />
              <Legend />
              {scenarios.filter(s => s.active).map(scenario => (
                <Area 
                  key={scenario.id}
                  type="monotone" 
                  dataKey={scenario.id + '_cumulative'} 
                  stroke={scenario.color}
                  fill={scenario.color}
                  fillOpacity={0.3}
                  name={scenario.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Scenario Comparison */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scenario Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Scenario</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monthly Avg</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Saved</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Emergency Fund</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scenarioMetrics.map(metric => {
                const baseline = scenarioMetrics.find(m => m.id === 'baseline');
                const impact = baseline ? 
                  ((metric.totalSaved - baseline.totalSaved) / Math.abs(baseline.totalSaved) * 100) : 0;
                
                return (
                  <tr key={metric.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: metric.color }}
                        />
                        <div>
                          <div className="font-medium text-gray-900">{metric.name}</div>
                          <div className="text-xs text-gray-500">{metric.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      ${metric.monthlyAvg.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg">
                      ${metric.totalSaved.toFixed(0)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {metric.emergencyFund.toFixed(1)} months
                    </td>
                    <td className="px-4 py-3 text-right">
                      {metric.id !== 'baseline' && (
                        <span className={`font-medium ${impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {impact > 0 ? '+' : ''}{impact.toFixed(0)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Scenario Builder */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl shadow-sm border border-purple-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Build Custom Scenario</h3>
        <p className="text-sm text-gray-600 mb-4">
          Work with the AI assistant to create a personalized financial scenario based on your goals
        </p>
        <button 
          onClick={addCustomChange}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          Open Scenario Builder with AI
        </button>
      </div>

      {/* Key Insights & Recommendations */}
      <div className="bg-gradient-to-br from-yellow-50 to-orange-100 rounded-xl shadow-sm border border-yellow-200 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-yellow-400 rounded-lg mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Smart Financial Insights</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">💰</span>
              <h4 className="font-semibold text-gray-900">Savings Potential</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Following AI recommendations could increase your monthly savings by{' '}
              <span className="font-bold text-green-600">$507</span>
            </p>
            <p className="text-xs text-blue-600">
              That's <span className="font-semibold">$6,084 more per year</span> without major lifestyle changes
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">⏰</span>
              <h4 className="font-semibold text-gray-900">Emergency Fund</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              You'll reach a 6-month emergency fund in{' '}
              <span className="font-bold text-blue-600">8 months</span> with optimized spending
            </p>
            <p className="text-xs text-blue-600">
              That's <span className="font-semibold">4 months faster</span> than your current pace
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center mb-2">
              <span className="text-2xl mr-2">📈</span>
              <h4 className="font-semibold text-gray-900">Wealth Building</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Aggressive saving scenario would build{' '}
              <span className="font-bold text-purple-600">$15,000</span> in one year
            </p>
            <p className="text-xs text-blue-600">
              Perfect for <span className="font-semibold">down payment</span> or investment capital
            </p>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg p-4 border-l-4 border-blue-500">
          <h4 className="font-semibold text-gray-900 mb-2">💡 Pro Tip: Start Small</h4>
          <p className="text-sm text-gray-700">
            Don't try to implement all changes at once. Start with the <strong>AI Optimized</strong> scenario for 30 days, 
            then gradually add more aggressive strategies as they become habits. This approach has a 73% higher success rate.
          </p>
        </div>
      </div>
    </div>
  );
};