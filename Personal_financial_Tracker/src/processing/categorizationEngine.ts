export interface CategoryResult {
  category: string;
  confidence: number;
  tags: string[];
}

class CategorizationEngine {
  private categories = {
    'Food & Dining': {
      keywords: ['restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'sushi', 'bakery', 
                 'deli', 'grocery', 'supermarket', 'market', 'food', 'dining', 'eat',
                 'mcdonald', 'subway', 'starbucks', 'dunkin', 'chipotle', 'panera'],
      patterns: [/\b(food|meal|lunch|dinner|breakfast)\b/i]
    },
    'Transportation': {
      keywords: ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'transit', 'metro',
                 'bus', 'train', 'airline', 'flight', 'car rental', 'toll'],
      patterns: [/\b(transport|commute|travel)\b/i]
    },
    'Shopping': {
      keywords: ['amazon', 'walmart', 'target', 'store', 'shop', 'mall', 'retail',
                 'clothing', 'shoes', 'fashion', 'department'],
      patterns: [/\b(purchase|buy|order)\b/i]
    },
    'Entertainment': {
      keywords: ['netflix', 'spotify', 'movie', 'cinema', 'theater', 'concert', 'game',
                 'music', 'streaming', 'hulu', 'disney', 'hbo', 'youtube'],
      patterns: [/\b(entertainment|show|event)\b/i]
    },
    'Utilities': {
      keywords: ['electric', 'gas', 'water', 'internet', 'cable', 'phone', 'mobile',
                 'verizon', 'att', 'comcast', 'utility', 'power', 'energy'],
      patterns: [/\b(bill|service|monthly)\b/i]
    },
    'Healthcare': {
      keywords: ['pharmacy', 'doctor', 'hospital', 'medical', 'health', 'dental',
                 'vision', 'insurance', 'cvs', 'walgreens', 'clinic'],
      patterns: [/\b(health|medical|prescription)\b/i]
    },
    'Housing': {
      keywords: ['rent', 'mortgage', 'lease', 'apartment', 'property', 'real estate',
                 'home', 'house', 'maintenance', 'repair'],
      patterns: [/\b(housing|residence|dwelling)\b/i]
    },
    'Insurance': {
      keywords: ['insurance', 'premium', 'coverage', 'policy', 'geico', 'allstate',
                 'progressive', 'state farm'],
      patterns: [/\b(insurance|coverage|premium)\b/i]
    },
    'Education': {
      keywords: ['school', 'university', 'college', 'tuition', 'course', 'class',
                 'book', 'education', 'training', 'student'],
      patterns: [/\b(education|learning|study)\b/i]
    },
    'Personal Care': {
      keywords: ['salon', 'spa', 'barber', 'hair', 'nail', 'beauty', 'cosmetic',
                 'gym', 'fitness', 'yoga', 'massage'],
      patterns: [/\b(personal|care|grooming)\b/i]
    },
    'Income': {
      keywords: ['salary', 'paycheck', 'deposit', 'transfer', 'income', 'payment',
                 'refund', 'reimbursement', 'dividend', 'interest'],
      patterns: [/\b(income|earning|revenue)\b/i]
    },
    'Investment': {
      keywords: ['investment', 'stock', 'bond', 'mutual fund', 'etf', 'crypto',
                 'bitcoin', 'trading', 'brokerage', 'robinhood', 'fidelity'],
      patterns: [/\b(invest|trade|portfolio)\b/i]
    },
    'Charity': {
      keywords: ['donation', 'charity', 'nonprofit', 'foundation', 'contribute',
                 'give', 'fundraiser'],
      patterns: [/\b(charity|donate|contribution)\b/i]
    },
    'Fees & Charges': {
      keywords: ['fee', 'charge', 'penalty', 'interest', 'overdraft', 'atm',
                 'service charge', 'late fee'],
      patterns: [/\b(fee|charge|penalty)\b/i]
    },
    'Travel': {
      keywords: ['hotel', 'motel', 'airbnb', 'booking', 'vacation', 'trip',
                 'resort', 'tourism', 'luggage'],
      patterns: [/\b(travel|vacation|trip)\b/i]
    },
    'Subscriptions': {
      keywords: ['subscription', 'membership', 'monthly', 'annual', 'recurring',
                 'prime', 'costco', 'sam'],
      patterns: [/\b(subscription|membership)\b/i]
    },
    'Pets': {
      keywords: ['pet', 'vet', 'veterinary', 'animal', 'dog', 'cat', 'petco',
                 'petsmart', 'grooming'],
      patterns: [/\b(pet|animal|veterinary)\b/i]
    },
    'Gifts': {
      keywords: ['gift', 'present', 'birthday', 'holiday', 'christmas', 'anniversary'],
      patterns: [/\b(gift|present)\b/i]
    },
    'Cash & ATM': {
      keywords: ['atm', 'cash', 'withdrawal', 'deposit'],
      patterns: [/\b(atm|cash|withdrawal)\b/i]
    },
    'Other': {
      keywords: [],
      patterns: []
    }
  };

  async categorize(description: string): Promise<CategoryResult> {
    const lowerDesc = description.toLowerCase();
    let bestMatch = {
      category: 'Other',
      score: 0,
      matchedKeywords: [] as string[]
    };

    for (const [category, rules] of Object.entries(this.categories)) {
      let score = 0;
      const matchedKeywords: string[] = [];

      // Check keywords
      for (const keyword of rules.keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          score += keyword.length > 5 ? 2 : 1;
          matchedKeywords.push(keyword);
        }
      }

      // Check patterns
      for (const pattern of rules.patterns) {
        if (pattern.test(description)) {
          score += 1.5;
        }
      }

      if (score > bestMatch.score) {
        bestMatch = { category, score, matchedKeywords };
      }
    }

    // Calculate confidence based on score
    const confidence = Math.min(bestMatch.score / 5, 1);

    // Generate tags based on matched keywords and additional analysis
    const tags = this.generateTags(description, bestMatch.matchedKeywords);

    return {
      category: bestMatch.category,
      confidence: confidence,
      tags
    };
  }

  private generateTags(description: string, matchedKeywords: string[]): string[] {
    const tags = [...matchedKeywords];
    
    // Add amount-based tags
    const amountMatch = description.match(/\$?([\d,]+\.?\d*)/);
    if (amountMatch) {
      const amount = parseFloat(amountMatch[1].replace(',', ''));
      if (amount > 1000) tags.push('high-value');
      if (amount < 10) tags.push('small-purchase');
    }

    // Add frequency tags
    if (description.match(/\b(monthly|weekly|annual|recurring)\b/i)) {
      tags.push('recurring');
    }

    // Add vendor-specific tags
    if (description.match(/\b(online|web|internet)\b/i)) {
      tags.push('online');
    }

    return [...new Set(tags)].slice(0, 5); // Return unique tags, max 5
  }

  async bulkCategorize(descriptions: string[]): Promise<CategoryResult[]> {
    return Promise.all(descriptions.map(desc => this.categorize(desc)));
  }

  getCategories(): string[] {
    return Object.keys(this.categories);
  }
}

export const categorizationEngine = new CategorizationEngine();