import { Router } from 'express';
import { UploadedFile } from 'express-fileupload';
import { databaseService } from '../../database';
import { csvParser } from '../../processing/csvParser';
import { pdfParser } from '../../processing/pdfParser';
import { categorizationEngine } from '../../processing/categorizationEngine';

const router = Router();
const db = databaseService;

interface Transaction {
  date: Date;
  description: string;
  amount: number;
  category?: string;
  account?: string;
  merchant?: string;
  notes?: string;
  tags?: string[];
}

router.post('/', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file as UploadedFile;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'pdf'].includes(fileExtension || '')) {
      return res.status(400).json({ error: 'Only CSV and PDF files are supported' });
    }

    let transactions: Transaction[] = [];
    
    if (fileExtension === 'csv') {
      const csvContent = file.data.toString('utf-8');
      transactions = await csvParser.parse(Buffer.from(csvContent));
    } else if (fileExtension === 'pdf') {
      transactions = await pdfParser.parse(file.data);
    }

    const categorizedTransactions = await Promise.all(
      transactions.map(async (transaction) => {
        const category = await categorizationEngine.categorize(transaction);
        return { ...transaction, category };
      })
    );

    const userId = req.headers['x-user-id'] as string || 'default-user';
    
    for (const transaction of categorizedTransactions) {
      await db.createTransaction({
        user_id: userId,
        date: transaction.date,
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        account: transaction.account || 'Main Account',
        type: transaction.amount < 0 ? 'expense' : 'income',
        merchant_name: transaction.merchant || null,
        notes: transaction.notes || null,
        tags: transaction.tags || [],
        is_recurring: false,
        confidence_score: 0.95
      });
    }

    // await db.refreshAnalytics(userId); // Method doesn't exist yet

    res.json({
      success: true,
      message: `Successfully processed ${categorizedTransactions.length} transactions`,
      transactions: categorizedTransactions,
      summary: {
        total: categorizedTransactions.length,
        income: categorizedTransactions.filter(t => t.amount > 0).length,
        expenses: categorizedTransactions.filter(t => t.amount < 0).length,
        categories: [...new Set(categorizedTransactions.map(t => t.category))]
      }
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      error: 'Failed to process file',
      details: error.message 
    });
  }
});

router.post('/validate', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const file = req.files.file as UploadedFile;
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (!['csv', 'pdf'].includes(fileExtension || '')) {
      return res.status(400).json({ 
        valid: false, 
        error: 'Only CSV and PDF files are supported' 
      });
    }

    let isValid = false;
    let preview: any[] = [];
    
    try {
      if (fileExtension === 'csv') {
        const csvContent = file.data.toString('utf-8');
        const transactions = await csvParser.parse(Buffer.from(csvContent));
        isValid = transactions.length > 0;
        preview = transactions.slice(0, 5);
      } else if (fileExtension === 'pdf') {
        const transactions = await pdfParser.parse(file.data);
        isValid = transactions.length > 0;
        preview = transactions.slice(0, 5);
      }
    } catch (parseError) {
      isValid = false;
    }

    res.json({
      valid: isValid,
      fileType: fileExtension,
      fileName: file.name,
      fileSize: file.size,
      preview: preview,
      message: isValid ? 'File is valid and ready to process' : 'File format is not recognized'
    });

  } catch (error: any) {
    console.error('Validation error:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Failed to validate file',
      details: error.message 
    });
  }
});

export default router;