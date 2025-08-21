import React from 'react';
import type { AIInsight } from '../types';

interface InsightsPanelProps {
  insights: AIInsight | null;
  onRefresh: () => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, onRefresh }) => {
  const healthColors = {
    good: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    critical: 'bg-red-100 text-red-800 border-red-200'
  };

  const healthIcons = {
    good: '✅',
    warning: '⚠️',
    critical: '🚨'
  };

  if (!insights) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500 mb-4">No insights available yet. Upload your bank statements to get started!</p>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Generate Insights
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Budget Health Status */}
      <div className={`rounded-lg border-2 p-6 ${healthColors[insights.budgetHealth]}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">{healthIcons[insights.budgetHealth]}</span>
              Budget Health: {insights.budgetHealth.toUpperCase()}
            </h3>
            <p className="mt-2">{insights.summary}</p>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {insights.alerts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">⚡ Alerts</h3>
          <div className="space-y-3">
            {insights.alerts.map((alert, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <span className="text-xl">
                  {alert.type === 'subscription' ? '🔄' : alert.type === 'unusual' ? '❗' : '💸'}
                </span>
                <div className="flex-1">
                  <p className="text-sm">{alert.message}</p>
                  {alert.amount && (
                    <p className="text-xs text-gray-600 mt-1">Amount: ${alert.amount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Recommendations</h3>
        <div className="space-y-2">
          {insights.recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3">
              <span className="text-green-500 mt-1">✓</span>
              <p className="text-sm text-gray-700">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Projections */}
      {insights.projections.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">📈 Financial Projections</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.projections.map((proj, index) => (
              <div key={index} className="border rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">{proj.period}</p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Path:</span>
                    <span className={`text-sm font-medium ${proj.projected < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                      ${proj.projected.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Recommended:</span>
                    <span className="text-sm font-medium text-green-600">
                      ${proj.recommended.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Potential Savings: ${(proj.recommended - proj.projected).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};