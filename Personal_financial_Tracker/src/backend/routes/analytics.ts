import { Router, Request, Response } from 'express';
import { databaseService } from '../../database';

const router = Router();

// Get spending by category
router.get('/categories', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const startDate = req.query.startDate 
            ? new Date(req.query.startDate as string) 
            : new Date(new Date().setMonth(new Date().getMonth() - 1));
        const endDate = req.query.endDate 
            ? new Date(req.query.endDate as string) 
            : new Date();

        const spending = await databaseService.getSpendingByCategory(userId, startDate, endDate);
        
        // Calculate totals
        const totalSpending = spending.reduce((sum, cat) => sum + cat.amount, 0);
        
        // Add percentages
        const spendingWithPercentages = spending.map(cat => ({
            ...cat,
            percentage: totalSpending > 0 ? (cat.amount / totalSpending) * 100 : 0
        }));

        res.json({
            success: true,
            startDate,
            endDate,
            totalSpending,
            categories: spendingWithPercentages
        });
    } catch (error) {
        console.error('Error fetching spending by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch spending data'
        });
    }
});

// Get monthly trends
router.get('/trends', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const months = parseInt(req.query.months as string) || 6;

        const trends = await databaseService.getMonthlyTrends(userId, months);
        
        // Calculate additional metrics
        const trendsWithMetrics = trends.map((month, index) => {
            const savings = month.income - month.expenses;
            const savingsRate = month.income > 0 ? (savings / month.income) * 100 : 0;
            
            // Calculate month-over-month changes
            let incomeChange = 0;
            let expenseChange = 0;
            if (index > 0) {
                const prevMonth = trends[index - 1];
                incomeChange = prevMonth.income > 0 
                    ? ((month.income - prevMonth.income) / prevMonth.income) * 100 
                    : 0;
                expenseChange = prevMonth.expenses > 0 
                    ? ((month.expenses - prevMonth.expenses) / prevMonth.expenses) * 100 
                    : 0;
            }
            
            return {
                ...month,
                savings,
                savingsRate,
                incomeChange,
                expenseChange
            };
        });

        res.json({
            success: true,
            months,
            trends: trendsWithMetrics
        });
    } catch (error) {
        console.error('Error fetching monthly trends:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch trends data'
        });
    }
});

// Get spending summary
router.get('/summary', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const period = req.query.period as string || 'month'; // month, quarter, year
        
        let startDate: Date;
        const endDate = new Date();
        
        switch (period) {
            case 'year':
                startDate = new Date(endDate.getFullYear(), 0, 1);
                break;
            case 'quarter':
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'month':
            default:
                startDate = new Date();
                startDate.setMonth(startDate.getMonth() - 1);
                break;
        }

        const transactions = await databaseService.getTransactions(userId, startDate, endDate);
        
        // Calculate summary metrics
        const income = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const expenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const savings = income - expenses;
        const transactionCount = transactions.length;
        const avgTransactionAmount = transactionCount > 0 
            ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactionCount 
            : 0;

        // Get top spending categories
        const categorySpending = new Map();
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const category = t.category || 'Uncategorized';
                const current = categorySpending.get(category) || 0;
                categorySpending.set(category, current + Math.abs(t.amount));
            });
            
        const topCategories = Array.from(categorySpending.entries())
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        res.json({
            success: true,
            period,
            startDate,
            endDate,
            summary: {
                income,
                expenses,
                savings,
                savingsRate: income > 0 ? (savings / income) * 100 : 0,
                transactionCount,
                avgTransactionAmount,
                topCategories
            }
        });
    } catch (error) {
        console.error('Error fetching spending summary:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch summary data'
        });
    }
});

// Get budget vs actual spending
router.get('/budget-comparison', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        
        // Get active budgets
        const budgets = await databaseService.getBudgets(userId, true);
        
        // Get current month transactions
        const startDate = new Date();
        startDate.setDate(1);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date();
        
        const transactions = await databaseService.getTransactions(userId, startDate, endDate);
        
        // Calculate actual spending per category
        const actualSpending = new Map();
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                const categoryId = t.category_id || t.category;
                if (categoryId) {
                    const current = actualSpending.get(categoryId) || 0;
                    actualSpending.set(categoryId, current + Math.abs(t.amount));
                }
            });
        
        // Compare budgets with actual
        const comparison = budgets.map(budget => {
            const actual = actualSpending.get(budget.category_id) || 0;
            const remaining = budget.amount - actual;
            const percentUsed = budget.amount > 0 ? (actual / budget.amount) * 100 : 0;
            
            return {
                categoryId: budget.category_id,
                budgeted: budget.amount,
                actual,
                remaining,
                percentUsed,
                status: percentUsed > 100 ? 'over' : percentUsed > 80 ? 'warning' : 'good'
            };
        });

        res.json({
            success: true,
            month: startDate.toISOString().slice(0, 7),
            budgetComparison: comparison
        });
    } catch (error) {
        console.error('Error fetching budget comparison:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch budget comparison'
        });
    }
});

export default router;