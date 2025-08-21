import React, { useState, useMemo } from 'react';
import type { Transaction } from '../types';

interface EnhancedTransactionListProps {
  transactions: Transaction[];
  initialBalance?: number;
}

export const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({ 
  transactions, 
  initialBalance = 0 
}) => {
  const [sortField, setSortField] = useState<'date' | 'amount' | 'category'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());

  // Calculate running balance
  const transactionsWithBalance = useMemo(() => {
    // Sort by date for accurate running balance
    const sorted = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = initialBalance;
    const withBalance = sorted.map(transaction => {
      runningBalance += transaction.amount;
      return {
        ...transaction,
        runningBalance
      };
    });

    // Reverse to show most recent first
    return withBalance.reverse();
  }, [transactions, initialBalance]);

  // Apply sorting
  const sortedTransactions = useMemo(() => {
    const sorted = [...transactionsWithBalance];
    sorted.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];
      
      if (sortField === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    return sorted;
  }, [transactionsWithBalance, sortField, sortDirection]);

  const handleSort = (field: 'date' | 'amount' | 'category') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedTransactions.size === transactions.length) {
      setSelectedTransactions(new Set());
    } else {
      setSelectedTransactions(new Set(transactions.map(t => t.id!)));
    }
  };

  const handleSelectTransaction = (id: string) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTransactions(newSelected);
  };

  const totalSelected = useMemo(() => {
    return sortedTransactions
      .filter(t => selectedTransactions.has(t.id!))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [selectedTransactions, sortedTransactions]);

  return (
    <div className="w-full">
      {/* Header Actions */}
      {selectedTransactions.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-800">
              {selectedTransactions.size} transaction{selectedTransactions.size !== 1 ? 's' : ''} selected
              <span className="ml-2 font-semibold">
                Total: ${totalSelected.toFixed(2)}
              </span>
            </p>
            <button 
              onClick={() => setSelectedTransactions(new Set())}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedTransactions.size === transactions.length && transactions.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center">
                  Date
                  {sortField === 'date' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('category')}
              >
                <div className="flex items-center">
                  Category
                  {sortField === 'category' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center justify-end">
                  Amount
                  {sortField === 'amount' && (
                    <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Running Balance
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTransactions.map((transaction) => (
              <tr 
                key={transaction.id} 
                className={`hover:bg-gray-50 ${selectedTransactions.has(transaction.id!) ? 'bg-blue-50' : ''}`}
              >
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.has(transaction.id!)}
                    onChange={() => handleSelectTransaction(transaction.id!)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{transaction.description}</div>
                    {transaction.notes && (
                      <div className="text-xs text-gray-500 mt-1">{transaction.notes}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {transaction.category || 'Uncategorized'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transaction.account || 'Main Account'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <span className={transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}>
                    {transaction.amount < 0 ? '-' : '+'}${Math.abs(transaction.amount).toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold">
                  <span className={transaction.runningBalance < 0 ? 'text-red-600' : 'text-gray-900'}>
                    ${transaction.runningBalance.toFixed(2)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center space-x-6">
            <div>
              <span className="text-sm text-gray-600">Total Income: </span>
              <span className="text-sm font-semibold text-green-600">
                ${transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Total Expenses: </span>
              <span className="text-sm font-semibold text-red-600">
                ${Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-sm text-gray-600">Current Balance: </span>
              <span className={`text-sm font-bold ${
                sortedTransactions[0]?.runningBalance >= 0 ? 'text-gray-900' : 'text-red-600'
              }`}>
                ${sortedTransactions[0]?.runningBalance?.toFixed(2) || '0.00'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};