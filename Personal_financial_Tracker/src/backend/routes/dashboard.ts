import { Router, Request, Response } from 'express';
import { databaseService } from '../../database';

const router = Router();

// Get complete dashboard data
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const period = req.query.period as string || 'month';
        
        // Calculate date ranges
        const endDate = new Date();
        let startDate = new Date();
        
        switch (period) {
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                break;
            case 'quarter':
                startDate.setMonth(startDate.getMonth() - 3);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(startDate.getMonth() - 1);
        }
        
        // Fetch all data in parallel
        const [
            transactions,
            trends,
            categories,
            budgets,
            recentUploads
        ] = await Promise.all([
            databaseService.getTransactions(userId, startDate, endDate),
            databaseService.getMonthlyTrends(userId, 6),
            databaseService.getSpendingByCategory(userId, startDate, endDate),
            databaseService.getBudgets(userId, true),
            databaseService.getUploadHistory(userId)
        ]);
        
        // Calculate dashboard metrics
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
        
        // Get recent transactions
        const recentTransactions = transactions
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);
        
        // Calculate category percentages
        const categoriesWithPercentage = categories.map(cat => ({
            ...cat,
            percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
        }));
        
        // Budget status
        const budgetStatus = budgets.map(budget => {
            const spent = categories.find(c => c.category === budget.category_id)?.amount || 0;
            return {
                category: budget.category_id,
                budgeted: budget.amount,
                spent,
                remaining: budget.amount - spent,
                percentUsed: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
            };
        });
        
        // Prepare dashboard response
        const dashboard = {
            overview: {
                period,
                startDate,
                endDate,
                totalIncome,
                totalExpenses,
                netSavings,
                savingsRate: savingsRate.toFixed(1),
                transactionCount: transactions.length
            },
            metrics: {
                avgDailySpending: totalExpenses / Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
                avgTransactionAmount: transactions.length > 0 
                    ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length 
                    : 0,
                largestExpense: transactions
                    .filter(t => t.type === 'expense')
                    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))[0] || null,
                mostFrequentCategory: categoriesWithPercentage.sort((a, b) => b.amount - a.amount)[0] || null
            },
            trends: {
                monthly: trends,
                currentMonth: trends[trends.length - 1] || null,
                previousMonth: trends[trends.length - 2] || null,
                changePercent: calculateChangePercent(trends)
            },
            categories: categoriesWithPercentage.slice(0, 10),
            budgets: budgetStatus,
            recentTransactions,
            recentUploads: recentUploads.slice(0, 5),
            alerts: generateDashboardAlerts(transactions, budgetStatus, savingsRate)
        };
        
        res.json({
            success: true,
            dashboard
        });
        
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard data'
        });
    }
});

// Get quick stats for dashboard widgets
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        
        // Get current month dates
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        // Get current and previous month transactions
        const [currentTransactions, previousTransactions] = await Promise.all([
            databaseService.getTransactions(userId, startOfMonth, endOfMonth),
            databaseService.getTransactions(
                userId,
                new Date(now.getFullYear(), now.getMonth() - 1, 1),
                new Date(now.getFullYear(), now.getMonth(), 0)
            )
        ]);
        
        // Calculate current month stats
        const currentIncome = currentTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const currentExpenses = currentTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        // Calculate previous month stats
        const previousIncome = previousTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        const previousExpenses = previousTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const stats = {
            currentMonth: {
                income: currentIncome,
                expenses: currentExpenses,
                savings: currentIncome - currentExpenses,
                transactionCount: currentTransactions.length
            },
            previousMonth: {
                income: previousIncome,
                expenses: previousExpenses,
                savings: previousIncome - previousExpenses,
                transactionCount: previousTransactions.length
            },
            changes: {
                income: calculatePercentChange(previousIncome, currentIncome),
                expenses: calculatePercentChange(previousExpenses, currentExpenses),
                savings: calculatePercentChange(
                    previousIncome - previousExpenses,
                    currentIncome - currentExpenses
                ),
                transactions: calculatePercentChange(
                    previousTransactions.length,
                    currentTransactions.length
                )
            }
        };
        
        res.json({
            success: true,
            stats
        });
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch dashboard stats'
        });
    }
});

// Helper functions
function calculateChangePercent(trends: any[]): number {
    if (trends.length < 2) return 0;
    
    const current = trends[trends.length - 1];
    const previous = trends[trends.length - 2];
    
    if (!previous || previous.expenses === 0) return 0;
    
    return ((current.expenses - previous.expenses) / previous.expenses) * 100;
}

function calculatePercentChange(oldValue: number, newValue: number): number {
    if (oldValue === 0) return newValue === 0 ? 0 : 100;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

function generateDashboardAlerts(transactions: any[], budgetStatus: any[], savingsRate: number): string[] {
    const alerts = [];
    
    // Check savings rate
    if (savingsRate < 10) {
        alerts.push({
            type: 'warning',
            message: `Low savings rate: ${savingsRate.toFixed(1)}%. Aim for at least 20%.`,
            priority: 'high'
        });
    }
    
    // Check budget overruns
    const overBudget = budgetStatus.filter(b => b.percentUsed > 100);
    if (overBudget.length > 0) {
        alerts.push({
            type: 'error',
            message: `${overBudget.length} categories are over budget`,
            priority: 'high'
        });
    }
    
    // Check for unusual transactions
    const avgAmount = transactions.length > 0
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
        : 0;
    
    const unusualTransactions = transactions.filter(t => Math.abs(t.amount) > avgAmount * 3);
    if (unusualTransactions.length > 0) {
        alerts.push({
            type: 'info',
            message: `${unusualTransactions.length} unusually large transactions detected`,
            priority: 'medium'
        });
    }
    
    // Positive alerts
    if (savingsRate >= 30) {
        alerts.push({
            type: 'success',
            message: `Excellent savings rate: ${savingsRate.toFixed(1)}%!`,
            priority: 'low'
        });
    }
    
    return alerts;
}

export default router;