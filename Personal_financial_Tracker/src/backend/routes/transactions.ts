import { Router, Request, Response } from 'express';
import { databaseService } from '../../database';

const router = Router();

// Get all transactions for a user
router.get('/', async (req: Request, res: Response) => {
    try {
        // For demo purposes, using a default user ID
        const userId = req.query.userId as string || 'demo-user';
        const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

        const transactions = await databaseService.getTransactions(userId, startDate, endDate);
        
        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
});

// Get transaction by ID
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.query.userId as string || 'demo-user';
        
        const transactions = await databaseService.getTransactions(userId);
        const transaction = transactions.find(t => t.id === id);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transaction'
        });
    }
});

// Create new transaction
router.post('/', async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || 'demo-user';
        const transactionData = {
            ...req.body,
            user_id: userId,
            source: 'manual'
        };

        const transaction = await databaseService.createTransaction(transactionData);
        
        if (!transaction) {
            return res.status(400).json({
                success: false,
                error: 'Failed to create transaction'
            });
        }

        res.status(201).json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create transaction'
        });
    }
});

// Create multiple transactions (bulk insert)
router.post('/bulk', async (req: Request, res: Response) => {
    try {
        const userId = req.body.userId || 'demo-user';
        const transactions = req.body.transactions || [];
        
        if (!Array.isArray(transactions) || transactions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid transactions data'
            });
        }

        const transactionsWithUser = transactions.map(t => ({
            ...t,
            user_id: userId,
            source: t.source || 'upload'
        }));

        const createdTransactions = await databaseService.createTransactions(transactionsWithUser);
        
        res.status(201).json({
            success: true,
            count: createdTransactions.length,
            transactions: createdTransactions
        });
    } catch (error) {
        console.error('Error creating transactions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create transactions'
        });
    }
});

// Update transaction
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const transaction = await databaseService.updateTransaction(id, updates);
        
        if (!transaction) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            transaction
        });
    } catch (error) {
        console.error('Error updating transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update transaction'
        });
    }
});

// Delete transaction
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        
        const success = await databaseService.deleteTransaction(id);
        
        if (!success) {
            return res.status(404).json({
                success: false,
                error: 'Transaction not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete transaction'
        });
    }
});

// Get transactions by category
router.get('/category/:categoryId', async (req: Request, res: Response) => {
    try {
        const { categoryId } = req.params;
        const userId = req.query.userId as string || 'demo-user';
        
        const transactions = await databaseService.getTransactionsByCategory(userId, categoryId);
        
        res.json({
            success: true,
            count: transactions.length,
            transactions
        });
    } catch (error) {
        console.error('Error fetching transactions by category:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch transactions'
        });
    }
});

export default router;