# 🔧 Troubleshooting Guide & FAQ

## Table of Contents
1. [Common Issues](#common-issues)
2. [Installation Problems](#installation-problems)
3. [Runtime Errors](#runtime-errors)
4. [Performance Issues](#performance-issues)
5. [Data Issues](#data-issues)
6. [Integration Problems](#integration-problems)
7. [Frequently Asked Questions](#frequently-asked-questions)
8. [Debug Tools](#debug-tools)
9. [Getting Help](#getting-help)

## Common Issues

### Application Won't Start

#### Symptom
```
Error: Cannot find module 'express'
```

#### Solution
```bash
# Clean install dependencies
rm -rf node_modules package-lock.json
npm install

# If persists, check Node version
node --version  # Should be 18+ or 20+
```

#### Symptom
```
Error: EADDRINUSE: address already in use :::3200
```

#### Solution
```bash
# Find process using port
# Windows
netstat -ano | findstr :3200
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :3200
kill -9 <PID>

# Or change port in .env
PORT=3201
```

#### Symptom
```
Error: Missing environment variables
```

#### Solution
```bash
# Create .env.local file
cp .env.example .env.local

# Edit with your values
# Required variables:
SUPABASE_URL=your_url
SUPABASE_ANON_KEY=your_key
CLAUDE_API_KEY=your_key
```

### Database Connection Issues

#### Symptom
```
Error: Connection to PostgreSQL failed
ECONNREFUSED 127.0.0.1:5432
```

#### Solution
```bash
# Check if PostgreSQL is running
# Windows
sc query postgresql

# Mac
brew services list | grep postgresql

# Linux
systemctl status postgresql

# Start if not running
# Windows
net start postgresql

# Mac
brew services start postgresql

# Linux
sudo systemctl start postgresql
```

#### Symptom
```
Error: password authentication failed for user
```

#### Solution
```sql
-- Reset password
ALTER USER your_user WITH PASSWORD 'new_password';

-- Or create new user
CREATE USER financetracker WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE finance_db TO financetracker;
```

#### Symptom
```
Error: Supabase connection timeout
```

#### Solution
1. Check Supabase project status at https://app.supabase.io
2. Verify credentials in .env.local
3. Check network/firewall settings
4. Try connection pooling:

```javascript
// Add to database config
const supabase = createClient(url, key, {
  db: {
    pooling: {
      max: 10,
      min: 2,
      idle: 30000
    }
  }
});
```

### Frontend Build Issues

#### Symptom
```
Error: Cannot resolve module '@/components/Dashboard'
```

#### Solution
```bash
# Check tsconfig paths
# tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# Clear cache and rebuild
rm -rf .vite dist
npm run build
```

#### Symptom
```
Error: Tailwind CSS not working
```

#### Solution
```javascript
// Check tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  // ...
}

// Verify PostCSS config
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

// Rebuild CSS
npm run build:css
```

## Installation Problems

### npm install Failures

#### Symptom
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

#### Solution
```bash
# Force resolution
npm install --legacy-peer-deps

# Or use exact versions
npm install --save-exact

# Clear npm cache
npm cache clean --force
```

#### Symptom
```
Error: Python not found (node-gyp)
```

#### Solution
```bash
# Windows - Install Python
choco install python

# Mac
brew install python

# Linux
sudo apt-get install python3

# Or skip optional dependencies
npm install --no-optional
```

### Docker Issues

#### Symptom
```
docker: Cannot connect to the Docker daemon
```

#### Solution
```bash
# Start Docker service
# Windows/Mac: Start Docker Desktop

# Linux
sudo systemctl start docker
sudo usermod -aG docker $USER
newgrp docker
```

#### Symptom
```
docker-compose: command not found
```

#### Solution
```bash
# Install Docker Compose
# Mac
brew install docker-compose

# Linux
sudo apt-get install docker-compose

# Or use Docker Compose V2
docker compose up
```

## Runtime Errors

### API Errors

#### Symptom
```
Error 429: Too Many Requests
```

#### Solution
```javascript
// Implement retry logic
const makeRequest = async (url, options, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After') || 60;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
};
```

#### Symptom
```
Error 401: Unauthorized
```

#### Solution
```javascript
// Check token expiration
const isTokenExpired = (token) => {
  const payload = JSON.parse(atob(token.split('.')[1]));
  return payload.exp * 1000 < Date.now();
};

// Refresh if expired
if (isTokenExpired(accessToken)) {
  const newToken = await refreshAuthToken();
  localStorage.setItem('accessToken', newToken);
}
```

### File Upload Errors

#### Symptom
```
Error: File too large
```

#### Solution
```javascript
// Increase limits in server config
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  abortOnLimit: true,
}));

// And in nginx if using
# nginx.conf
client_max_body_size 50M;
```

#### Symptom
```
Error: Invalid file format
```

#### Solution
```javascript
// Validate file type
const allowedTypes = ['text/csv', 'application/pdf'];
if (!allowedTypes.includes(file.mimetype)) {
  throw new Error('Invalid file type. Only CSV and PDF allowed.');
}

// Check file extension
const allowedExtensions = ['.csv', '.pdf'];
const ext = path.extname(file.name).toLowerCase();
if (!allowedExtensions.includes(ext)) {
  throw new Error('Invalid file extension');
}
```

### Processing Errors

#### Symptom
```
Error: Transaction categorization failed
```

#### Solution
```javascript
// Add fallback categorization
try {
  category = await aiCategorizer.categorize(transaction);
} catch (error) {
  console.warn('AI categorization failed, using rules');
  category = ruleCategorizer.categorize(transaction);
}

// Or set to uncategorized
if (!category) {
  category = 'Uncategorized';
  await flagForReview(transaction);
}
```

## Performance Issues

### Slow Page Load

#### Diagnosis
```javascript
// Measure performance
console.time('PageLoad');
window.addEventListener('load', () => {
  console.timeEnd('PageLoad');
  
  // Check specific metrics
  const perfData = performance.getEntriesByType('navigation')[0];
  console.log('DOM Interactive:', perfData.domInteractive);
  console.log('DOM Complete:', perfData.domComplete);
  console.log('Load Complete:', perfData.loadEventEnd);
});
```

#### Solutions

1. **Enable Compression**
```javascript
// server.js
import compression from 'compression';
app.use(compression());
```

2. **Implement Code Splitting**
```javascript
// React lazy loading
const Dashboard = lazy(() => import('./components/Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}
```

3. **Optimize Images**
```bash
# Install image optimization
npm install --save-dev imagemin imagemin-webp

# Convert images to WebP
npx imagemin images/*.{jpg,png} --out-dir=images/optimized --plugin=webp
```

### Slow API Responses

#### Diagnosis
```javascript
// API timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`Slow API: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  next();
});
```

#### Solutions

1. **Add Database Indexes**
```sql
-- Check slow queries
EXPLAIN ANALYZE
SELECT * FROM transactions 
WHERE user_id = '123' 
ORDER BY created_at DESC;

-- Add appropriate indexes
CREATE INDEX idx_transactions_user_created 
ON transactions(user_id, created_at DESC);
```

2. **Implement Caching**
```javascript
// Redis caching
const getCachedOrFetch = async (key, fetchFn, ttl = 3600) => {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetchFn();
  await redis.setex(key, ttl, JSON.stringify(data));
  return data;
};
```

3. **Use Pagination**
```javascript
// Limit results
const getTransactions = async (page = 1, limit = 50) => {
  const offset = (page - 1) * limit;
  return db.query(
    'SELECT * FROM transactions LIMIT $1 OFFSET $2',
    [limit, offset]
  );
};
```

### High Memory Usage

#### Diagnosis
```bash
# Monitor Node.js memory
node --expose-gc --inspect server.js

# In Chrome DevTools
chrome://inspect

# Or use command line
node -e "console.log(process.memoryUsage())"
```

#### Solutions

1. **Fix Memory Leaks**
```javascript
// Clear timers
const timers = new Set();

const createTimer = (fn, delay) => {
  const timer = setTimeout(() => {
    fn();
    timers.delete(timer);
  }, delay);
  timers.add(timer);
  return timer;
};

// Cleanup on shutdown
process.on('SIGTERM', () => {
  timers.forEach(timer => clearTimeout(timer));
});
```

2. **Stream Large Files**
```javascript
// Don't load entire file in memory
const processLargeCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Process row immediately
        processRow(row);
      })
      .on('end', resolve)
      .on('error', reject);
  });
};
```

## Data Issues

### Missing Transactions

#### Diagnosis
```sql
-- Check for gaps in data
SELECT 
  DATE(transaction_date) as date,
  COUNT(*) as count
FROM transactions
WHERE user_id = 'user123'
GROUP BY DATE(transaction_date)
ORDER BY date;
```

#### Solutions
```javascript
// Verify import completeness
const verifyImport = async (uploadId) => {
  const upload = await db.query(
    'SELECT expected_count, imported_count FROM uploads WHERE id = $1',
    [uploadId]
  );
  
  if (upload.expected_count !== upload.imported_count) {
    console.error(`Import incomplete: ${upload.imported_count}/${upload.expected_count}`);
    await retryImport(uploadId);
  }
};
```

### Incorrect Categorization

#### Fix Individual Transactions
```javascript
// Manual recategorization
const recategorize = async (transactionId, newCategory) => {
  await db.query(
    'UPDATE transactions SET category = $1, manually_categorized = true WHERE id = $2',
    [newCategory, transactionId]
  );
  
  // Train model with correction
  await mlModel.addTrainingData(transactionId, newCategory);
};
```

#### Bulk Corrections
```sql
-- Fix common miscategorizations
UPDATE transactions
SET category = 'Groceries'
WHERE merchant_name ILIKE '%whole foods%'
AND category != 'Groceries';
```

### Duplicate Transactions

#### Detection
```sql
-- Find duplicates
SELECT 
  amount, 
  merchant_name, 
  transaction_date,
  COUNT(*) as count
FROM transactions
GROUP BY amount, merchant_name, transaction_date
HAVING COUNT(*) > 1;
```

#### Prevention
```javascript
// Deduplication during import
const isDuplicate = async (transaction) => {
  const existing = await db.query(
    `SELECT id FROM transactions 
     WHERE user_id = $1 
     AND amount = $2 
     AND merchant_name = $3 
     AND transaction_date = $4`,
    [transaction.userId, transaction.amount, 
     transaction.merchant, transaction.date]
  );
  return existing.rows.length > 0;
};
```

## Integration Problems

### Bank Connection Failed

#### Plaid Integration
```javascript
// Error handling for Plaid
try {
  const response = await plaidClient.transactionsGet(request);
} catch (error) {
  if (error.error_code === 'ITEM_LOGIN_REQUIRED') {
    // Trigger re-authentication
    const linkToken = await createLinkToken(userId);
    return { requiresAuth: true, linkToken };
  }
  
  if (error.error_code === 'RATE_LIMIT') {
    // Implement backoff
    await delay(60000);
    return retryRequest();
  }
}
```

### AI Service Errors

#### Claude API Issues
```javascript
// Fallback strategy
const getAIInsights = async (data) => {
  try {
    return await claudeAPI.analyze(data);
  } catch (error) {
    console.warn('Claude API failed, trying GPT-4');
    try {
      return await openAI.analyze(data);
    } catch {
      console.warn('All AI services failed, using rule-based');
      return ruleBasedAnalyzer.analyze(data);
    }
  }
};
```

## Frequently Asked Questions

### General Questions

**Q: How secure is my financial data?**
A: We use bank-level encryption (AES-256) for data at rest and TLS 1.3 for data in transit. Your credentials are never stored - we use OAuth tokens. All data is encrypted in our database and backups.

**Q: Can I delete my data?**
A: Yes, you can delete all your data at any time from Settings → Privacy → Delete Account. This permanently removes all your transactions, insights, and account information within 24 hours.

**Q: Why are some transactions uncategorized?**
A: New or unusual merchants may not be recognized immediately. The AI learns from your corrections - simply recategorize them manually and future similar transactions will be categorized correctly.

**Q: How accurate is the categorization?**
A: Our AI achieves 96% accuracy on common transactions. Accuracy improves over time as it learns your specific patterns. You can always override categories manually.

### Technical Questions

**Q: What browsers are supported?**
A: 
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

**Q: Can I self-host the application?**
A: Yes! Follow our deployment guide for Docker or manual installation. You'll need PostgreSQL, Redis (optional), and a Claude API key.

**Q: Is there an API?**
A: Yes, full REST API available. Generate an API key in Settings and see our API documentation for endpoints and examples.

**Q: Can I export my data?**
A: Yes, export in CSV, JSON, or PDF format from the Export section. You can export all data or filter by date range and categories.

### Account Questions

**Q: I forgot my password. How do I reset it?**
A: Click "Forgot Password" on the login page. Enter your email and follow the reset link sent to you (valid for 1 hour).

**Q: Can I have multiple accounts?**
A: Yes, you can create separate accounts with different email addresses. We also support family accounts with individual profiles under one login.

**Q: How do I change my email address?**
A: Go to Settings → Account → Email. Enter your new email and confirm via the verification link sent to both addresses.

### Billing Questions

**Q: Is there a free tier?**
A: Yes, the basic version is free forever with:
- 500 transactions/month
- 3 months history
- Basic categorization
- Standard insights

**Q: What payment methods do you accept?**
A: We accept all major credit cards, PayPal, and ACH transfers for annual plans.

**Q: Can I cancel anytime?**
A: Yes, cancel anytime from Settings → Billing. You'll retain access until the end of your billing period.

### Feature Questions

**Q: Can I track cash transactions?**
A: Yes, manually add cash transactions via the "Add Transaction" button. They're treated the same as bank transactions for analytics.

**Q: Does it support multiple currencies?**
A: Currently USD, EUR, GBP, CAD, and AUD. Currency conversion uses daily exchange rates. More currencies coming soon.

**Q: Can I set budgets?**
A: Yes, create monthly or category-specific budgets. Get alerts when approaching limits. AI suggests optimal budget based on your history.

**Q: Is there a mobile app?**
A: We offer a Progressive Web App (PWA) that works like a native app. Install from your mobile browser - no app store needed.

## Debug Tools

### Enable Debug Mode

```javascript
// Add to .env.local
DEBUG=true
LOG_LEVEL=debug

// In code
if (process.env.DEBUG) {
  console.debug('Transaction data:', transaction);
  console.debug('Categorization result:', category);
}
```

### Browser DevTools

```javascript
// Debug React components
// Install React DevTools extension

// Debug network requests
// Chrome DevTools → Network tab → Filter XHR

// Debug performance
// Chrome DevTools → Performance → Record

// Debug memory leaks
// Chrome DevTools → Memory → Heap Snapshot
```

### Database Queries

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_duration = on;
SELECT pg_reload_conf();

-- Check active queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query 
FROM pg_stat_activity 
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running query
SELECT pg_terminate_backend(pid);
```

### API Testing

```bash
# Test with curl
curl -X POST http://localhost:3200/api/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@statement.csv"

# Test with httpie
http POST localhost:3200/api/transactions \
  Authorization:"Bearer YOUR_TOKEN" \
  amount=-25.50 \
  merchant="Starbucks"

# Load testing with artillery
artillery quick --count 10 --num 100 \
  http://localhost:3200/api/transactions
```

### Log Analysis

```bash
# Search logs for errors
grep -i error app.log | tail -50

# Count errors by type
grep -i error app.log | cut -d' ' -f5 | sort | uniq -c

# Monitor logs in real-time
tail -f app.log | grep -i error

# Use jq for JSON logs
tail -f app.log | jq 'select(.level=="error")'
```

## Getting Help

### Self-Help Resources

1. **Documentation**: https://docs.financetracker.io
2. **Video Tutorials**: https://youtube.com/financetracker
3. **Community Forum**: https://forum.financetracker.io
4. **Stack Overflow**: Tag `personal-finance-tracker`

### Contact Support

**For Technical Issues:**
- Email: support@financetracker.io
- Response time: < 24 hours

**For Security Issues:**
- Email: security@financetracker.io
- PGP Key: Available on website

**For Sales/Billing:**
- Email: sales@financetracker.io
- Phone: 1-800-FINANCE

### Bug Reports

Report bugs on GitHub:
https://github.com/financetracker/app/issues

Include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Screenshots if applicable
5. Browser/OS information
6. Error messages from console

### Feature Requests

Submit feature requests:
https://feedback.financetracker.io

Popular requests are reviewed monthly and added to our roadmap.

---

## Quick Fixes Checklist

Before contacting support, try these:

- [ ] Clear browser cache and cookies
- [ ] Try incognito/private mode
- [ ] Disable browser extensions
- [ ] Check internet connection
- [ ] Verify API service status
- [ ] Review recent changes
- [ ] Check error logs
- [ ] Restart application
- [ ] Update to latest version
- [ ] Review documentation

---

*Troubleshooting Guide v1.0.0 | Last Updated: January 2025*