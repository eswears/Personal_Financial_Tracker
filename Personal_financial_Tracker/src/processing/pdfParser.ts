import * as pdfParse from 'pdf-parse';
import { RawTransaction } from './csvParser';

class PDFParser {
  private transactionPatterns = [
    // Common bank statement patterns
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+(\$?[\d,]+\.?\d*)/g,
    /(\d{4}-\d{2}-\d{2})\s+(.+?)\s+([\d,]+\.?\d*)\s*(?:CR|DR)?/g,
    /(\w{3}\s+\d{1,2},?\s+\d{4})\s+(.+?)\s+(\$?[\d,]+\.?\d*)/g
  ];

  async parse(fileBuffer: Buffer): Promise<RawTransaction[]> {
    try {
      const data = await pdfParse(fileBuffer);
      const text = data.text;
      
      return this.extractTransactions(text);
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error.message}`);
    }
  }

  private extractTransactions(text: string): RawTransaction[] {
    const transactions: RawTransaction[] = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const transaction = this.parseTransactionLine(line);
      if (transaction) {
        transactions.push(transaction);
      }
    }
    
    // If no transactions found with line-by-line, try pattern matching
    if (transactions.length === 0) {
      for (const pattern of this.transactionPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          try {
            const [, dateStr, description, amountStr] = match;
            const transaction: RawTransaction = {
              date: this.parseDate(dateStr),
              description: this.cleanDescription(description),
              amount: this.parseAmount(amountStr)
            };
            transactions.push(transaction);
          } catch (error) {
            // Skip malformed transactions
          }
        }
        
        if (transactions.length > 0) break;
      }
    }
    
    return transactions;
  }

  private parseTransactionLine(line: string): RawTransaction | null {
    // Skip empty lines or headers
    if (!line.trim() || line.includes('Balance') || line.includes('Page')) {
      return null;
    }
    
    // Try to match common transaction patterns
    const patterns = [
      // Date at start: MM/DD/YYYY Description Amount
      /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+?)\s+(\$?[\d,]+\.?\d*)$/,
      // Date Description Amount with CR/DR
      /^(\d{1,2}[\/\-]\d{1,2})\s+(.+?)\s+([\d,]+\.\d{2})\s*(CR|DR)?$/,
      // Month Day Description Amount
      /^(\w{3}\s+\d{1,2})\s+(.+?)\s+(\$?[\d,]+\.?\d*)$/
    ];
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        try {
          const [, dateStr, description, amountStr, type] = match;
          return {
            date: this.parseDate(dateStr),
            description: this.cleanDescription(description),
            amount: this.parseAmount(amountStr) * (type === 'DR' ? -1 : 1)
          };
        } catch (error) {
          // Continue to next pattern
        }
      }
    }
    
    return null;
  }

  private parseDate(dateStr: string): Date {
    const cleaned = dateStr.trim();
    
    // Handle various date formats
    if (cleaned.match(/^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$/)) {
      const parts = cleaned.split(/[\/\-]/);
      const month = parseInt(parts[0]);
      const day = parseInt(parts[1]);
      let year = parseInt(parts[2]);
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 30 ? 2000 : 1900;
      }
      
      return new Date(year, month - 1, day);
    }
    
    // Handle "MMM DD, YYYY" format
    if (cleaned.match(/^\w{3}\s+\d{1,2},?\s+\d{4}$/)) {
      return new Date(cleaned);
    }
    
    // Handle "MMM DD" format (assume current year)
    if (cleaned.match(/^\w{3}\s+\d{1,2}$/)) {
      const currentYear = new Date().getFullYear();
      return new Date(`${cleaned} ${currentYear}`);
    }
    
    // Try standard parsing
    const parsed = new Date(cleaned);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    throw new Error(`Unable to parse date: ${dateStr}`);
  }

  private parseAmount(amountStr: string): number {
    const cleaned = amountStr
      .replace(/[$,]/g, '')
      .replace(/\s/g, '')
      .trim();
    
    return parseFloat(cleaned);
  }

  private cleanDescription(description: string): string {
    return description
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\*+/g, '')
      .substring(0, 200); // Limit length
  }
}

export const pdfParser = new PDFParser();