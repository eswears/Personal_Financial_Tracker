import { Router, Request, Response } from 'express';
import { databaseService } from '../../database';

const router = Router();

// Generate AI insights
router.post('/insights', async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || 'demo-user';
        const month = req.body.month ? new Date(req.body.month) : new Date();
        
        // Check for cached insights
        const cachedInsights = await databaseService.getAIInsight(userId, month);
        if (cachedInsights) {
            return res.json({
                success: true,
                cached: true,
                insights: cachedInsights.insights
            });
        }
        
        // Get transaction data for analysis
        const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
        const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const transactions = await databaseService.getTransactions(userId, startDate, endDate);
        const trends = await databaseService.getMonthlyTrends(userId, 6);
        const categories = await databaseService.getSpendingByCategory(userId, startDate, endDate);
        
        // Generate insights (mock AI response for now)
        const insights = {
            summary: generateSummary(transactions, trends),
            recommendations: generateRecommendations(transactions, categories),
            alerts: generateAlerts(transactions, trends),
            projections: generateProjections(trends),
            savingsTips: generateSavingsTips(categories),
            financialHealth: calculateFinancialHealth(transactions, trends)
        };
        
        // Cache the insights
        await databaseService.saveAIInsight({
            user_id: userId,
            month: startDate,
            insights
        });
        
        res.json({
            success: true,
            cached: false,
            insights
        });
        
    } catch (error) {
        console.error('Error generating AI insights:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate insights'
        });
    }
});

// Helper functions for generating insights
function generateSummary(transactions: any[], trends: any[]): string {
    const totalSpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savings = totalIncome - totalSpending;
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
    
    return `This month, you earned $${totalIncome.toFixed(2)} and spent $${totalSpending.toFixed(2)}, ` +
           `resulting in ${savings >= 0 ? 'savings' : 'a deficit'} of $${Math.abs(savings).toFixed(2)} ` +
           `(${savingsRate.toFixed(1)}% savings rate).`;
}

function generateRecommendations(transactions: any[], categories: any[]): string[] {
    const recommendations = [];
    
    // Find highest spending category
    if (categories.length > 0) {
        const topCategory = categories.sort((a, b) => b.amount - a.amount)[0];
        recommendations.push(
            `Consider reducing spending in ${topCategory.category} which accounts for ` +
            `$${topCategory.amount.toFixed(2)} of your expenses.`
        );
    }
    
    // Check for subscription patterns
    const recurringPatterns = findRecurringTransactions(transactions);
    if (recurringPatterns.length > 0) {
        recommendations.push(
            `Review your ${recurringPatterns.length} recurring subscriptions totaling ` +
            `$${recurringPatterns.reduce((sum, t) => sum + Math.abs(t.amount), 0).toFixed(2)} per month.`
        );
    }
    
    // Savings recommendation
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    if (income > 0) {
        recommendations.push(
            `Aim to save at least 20% of your income ($${(income * 0.2).toFixed(2)}) each month.`
        );
    }
    
    return recommendations;
}

function generateAlerts(transactions: any[], trends: any[]): string[] {
    const alerts = [];
    
    // Check for unusual spending
    const currentMonthSpending = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    if (trends.length > 1) {
        const avgSpending = trends.reduce((sum, t) => sum + t.expenses, 0) / trends.length;
        if (currentMonthSpending > avgSpending * 1.2) {
            alerts.push(
                `  Your spending this month is 20% higher than your average.`
            );
        }
    }
    
    // Check for large transactions
    const largeTransactions = transactions.filter(t => Math.abs(t.amount) > 500);
    if (largeTransactions.length > 0) {
        alerts.push(
            `=Ì You had ${largeTransactions.length} large transactions over $500 this month.`
        );
    }
    
    return alerts;
}

function generateProjections(trends: any[]): any[] {
    if (trends.length < 3) return [];
    
    // Simple linear projection for next 3 months
    const projections = [];
    const recentTrends = trends.slice(-3);
    
    const avgIncome = recentTrends.reduce((sum, t) => sum + t.income, 0) / recentTrends.length;
    const avgExpenses = recentTrends.reduce((sum, t) => sum + t.expenses, 0) / recentTrends.length;
    
    for (let i = 1; i <= 3; i++) {
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + i);
        
        projections.push({
            month: futureDate.toISOString().slice(0, 7),
            projectedIncome: avgIncome,
            projectedExpenses: avgExpenses,
            projectedSavings: avgIncome - avgExpenses
        });
    }
    
    return projections;
}

function generateSavingsTips(categories: any[]): string[] {
    const tips = [];
    
    // Find categories with high spending
    const highSpendingCategories = categories
        .filter(c => c.amount > 200)
        .sort((a, b) => b.amount - a.amount);
    
    if (highSpendingCategories.length > 0) {
        tips.push(
            `Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings and debt repayment.`
        );
        
        const foodCategory = categories.find(c => 
            c.category.toLowerCase().includes('food') || 
            c.category.toLowerCase().includes('dining')
        );
        
        if (foodCategory && foodCategory.amount > 400) {
            tips.push(
                `Consider meal planning to reduce food expenses by up to 25%.`
            );
        }
    }
    
    tips.push(
        `Set up automatic transfers to savings right after payday.`,
        `Track daily expenses to identify unnecessary spending patterns.`
    );
    
    return tips;
}

function calculateFinancialHealth(transactions: any[], trends: any[]): any {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
    
    let score = 50; // Base score
    
    // Adjust based on savings rate
    if (savingsRate >= 20) score += 30;
    else if (savingsRate >= 10) score += 20;
    else if (savingsRate >= 5) score += 10;
    else if (savingsRate < 0) score -= 20;
    
    // Adjust based on spending consistency
    if (trends.length > 3) {
        const spendingVariance = calculateVariance(trends.map(t => t.expenses));
        if (spendingVariance < 0.2) score += 10; // Consistent spending
    }
    
    // Adjust based on income stability
    if (trends.length > 3) {
        const incomeVariance = calculateVariance(trends.map(t => t.income));
        if (incomeVariance < 0.1) score += 10; // Stable income
    }
    
    return {
        score: Math.min(100, Math.max(0, score)),
        rating: score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Fair' : 'Needs Improvement',
        factors: {
            savingsRate: savingsRate.toFixed(1) + '%',
            monthlyIncome: '$' + income.toFixed(2),
            monthlyExpenses: '$' + expenses.toFixed(2),
            trend: trends.length > 1 && trends[trends.length - 1].expenses > trends[trends.length - 2].expenses 
                ? 'increasing' : 'stable'
        }
    };
}

function findRecurringTransactions(transactions: any[]): any[] {
    const recurring = [];
    const descriptionMap = new Map();
    
    transactions.forEach(t => {
        const key = t.description.toLowerCase().replace(/[0-9]/g, '').trim();
        if (!descriptionMap.has(key)) {
            descriptionMap.set(key, []);
        }
        descriptionMap.get(key).push(t);
    });
    
    descriptionMap.forEach((trans, key) => {
        if (trans.length >= 2) {
            // Check if amounts are similar
            const amounts = trans.map(t => Math.abs(t.amount));
            const avgAmount = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = calculateVariance(amounts);
            
            if (variance < 0.1) {
                recurring.push({
                    description: trans[0].description,
                    amount: avgAmount,
                    frequency: trans.length
                });
            }
        }
    });
    
    return recurring;
}

function calculateVariance(numbers: number[]): number {
    if (numbers.length === 0) return 0;
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;
    return variance / (mean * mean); // Coefficient of variation
}

export default router;