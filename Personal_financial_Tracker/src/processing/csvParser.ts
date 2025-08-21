export interface RawTransaction {
  date: Date;
  description: string;
  amount: number;
  account?: string;
}

class CSVParser {
  private parseDate(dateStr: string): Date {
    // Try multiple date formats
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/,  // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/,  // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/,  // MM-DD-YYYY
      /^\d{1,2}\/\d{1,2}\/\d{4}$/  // M/D/YYYY
    ];
    
    const cleanDate = dateStr.trim();
    
    // Try standard parsing first
    const parsed = new Date(cleanDate);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
    
    // Try manual parsing for MM/DD/YYYY format
    if (cleanDate.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
      const [month, day, year] = cleanDate.split('/');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    
    throw new Error(`Unable to parse date: ${dateStr}`);
  }

  private parseAmount(amountStr: string): number {
    // Remove currency symbols and commas
    const cleaned = amountStr
      .replace(/[$£€¥]/g, '')
      .replace(/,/g, '')
      .replace(/\s/g, '')
      .trim();
    
    // Handle parentheses for negative amounts
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1));
    }
    
    // Handle explicit negative sign
    return parseFloat(cleaned);
  }

  async parse(fileBuffer: Buffer): Promise<RawTransaction[]> {
    const content = fileBuffer.toString('utf-8');
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    
    if (lines.length < 2) {
      throw new Error('CSV file must contain header and at least one data row');
    }
    
    // Parse header
    const header = this.parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indices
    const dateIndex = this.findColumnIndex(header, ['date', 'transaction date', 'posted date']);
    const descIndex = this.findColumnIndex(header, ['description', 'desc', 'merchant', 'payee']);
    const amountIndex = this.findColumnIndex(header, ['amount', 'debit', 'credit', 'value']);
    const accountIndex = this.findColumnIndex(header, ['account', 'account number', 'card']);
    
    if (dateIndex === -1 || descIndex === -1 || amountIndex === -1) {
      throw new Error('CSV must contain date, description, and amount columns');
    }
    
    // Parse data rows
    const transactions: RawTransaction[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      try {
        const row = this.parseCSVLine(lines[i]);
        
        if (row.length <= Math.max(dateIndex, descIndex, amountIndex)) {
          continue; // Skip incomplete rows
        }
        
        const transaction: RawTransaction = {
          date: this.parseDate(row[dateIndex]),
          description: row[descIndex].trim(),
          amount: this.parseAmount(row[amountIndex]),
          account: accountIndex !== -1 ? row[accountIndex]?.trim() : undefined
        };
        
        // Validate transaction
        if (transaction.description && !isNaN(transaction.amount)) {
          transactions.push(transaction);
        }
      } catch (error) {
        console.warn(`Skipping row ${i}: ${error.message}`);
      }
    }
    
    return transactions;
  }

  private parseCSVLine(line: string): string[] {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current);
    return result;
  }

  private findColumnIndex(header: string[], possibleNames: string[]): number {
    for (const name of possibleNames) {
      const index = header.findIndex(h => h.includes(name));
      if (index !== -1) return index;
    }
    return -1;
  }
}

export const csvParser = new CSVParser();