// In-memory database implementation for when Supabase is unavailable
class MemoryDatabase {
  constructor() {
    this.transactions = [];
    this.categories = this.getDefaultCategories();
    this.nextId = 1;
  }

  // Transaction Methods
  async getTransactions() {
    return this.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  async getTransaction(id) {
    return this.transactions.find(t => t.id === id);
  }

  async saveTransactions(transactions) {
    const saved = transactions.map(t => ({
      ...t,
      id: t.id || `txn_${this.nextId++}`,
      user_id: 'default',
      created_at: new Date().toISOString(),
      category_id: this.getCategoryId(t.category)
    }));
    this.transactions.push(...saved);
    return saved;
  }

  async updateTransactionCategory(id, category) {
    const transaction = this.transactions.find(t => t.id === id);
    if (transaction) {
      transaction.category = category;
      transaction.category_id = this.getCategoryId(category);
      transaction.updated_at = new Date().toISOString();
      return transaction;
    }
    throw new Error('Transaction not found');
  }

  async deleteTransaction(id) {
    const index = this.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      this.transactions.splice(index, 1);
      return true;
    }
    throw new Error('Transaction not found');
  }

  // Analytics Methods
  async getSpendingByCategory(startDate, endDate) {
    const start = startDate || '1900-01-01';
    const end = endDate || '2100-12-31';
    
    const filtered = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= new Date(start) && 
             date <= new Date(end) && 
             t.amount < 0;
    });
    
    const grouped = {};
    filtered.forEach(t => {
      const cat = t.category || 'uncategorized';
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += Math.abs(t.amount);
    });
    
    const total = Object.values(grouped).reduce((sum, amt) => sum + amt, 0);
    
    return Object.entries(grouped).map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      transactionCount: filtered.filter(t => t.category === category).length
    }));
  }

  async getMonthlyTrends(months = 6) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    
    const filtered = this.transactions.filter(t => {
      const date = new Date(t.date);
      return date >= startDate && date <= endDate;
    });
    
    const trends = {};
    filtered.forEach(t => {
      const date = new Date(t.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!trends[monthKey]) {
        trends[monthKey] = {
          month: monthKey,
          year: date.getFullYear(),
          income: 0,
          expenses: 0,
          net: 0,
          categories: {}
        };
      }
      
      if (t.amount > 0) {
        trends[monthKey].income += t.amount;
      } else {
        trends[monthKey].expenses += Math.abs(t.amount);
        const cat = t.category || 'uncategorized';
        if (!trends[monthKey].categories[cat]) {
          trends[monthKey].categories[cat] = 0;
        }
        trends[monthKey].categories[cat] += Math.abs(t.amount);
      }
    });
    
    return Object.values(trends).map(trend => ({
      ...trend,
      net: trend.income - trend.expenses,
      categories: Object.entries(trend.categories).map(([category, amount]) => ({
        category,
        amount,
        percentage: trend.expenses > 0 ? (amount / trend.expenses) * 100 : 0
      }))
    }));
  }

  // Helper Methods
  getCategoryId(categoryName) {
    const categoryMap = {
      'food': 1,
      'transport': 2,
      'utilities': 3,
      'entertainment': 4,
      'shopping': 5,
      'health': 6,
      'education': 7,
      'other': 8
    };
    return categoryMap[categoryName?.toLowerCase()] || 8;
  }

  getDefaultCategories() {
    return [
      'food',
      'transport', 
      'utilities',
      'entertainment',
      'shopping',
      'health',
      'education',
      'other'
    ];
  }
}

// Export singleton instance
module.exports = {
  memoryDatabase: new MemoryDatabase()
};