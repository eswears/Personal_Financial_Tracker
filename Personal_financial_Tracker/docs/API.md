# 🔌 API Documentation

## Overview

The Personal Finance Tracker API is a RESTful service that provides programmatic access to all financial tracking features. Built with Express.js and TypeScript, it offers robust endpoints for transaction management, analytics, and AI-powered insights.

## Base URL

```
Development: http://localhost:3200/api
Production: https://api.financetracker.io/api
```

## Authentication

### API Key Authentication

All API requests require authentication via API key:

```http
Authorization: Bearer YOUR_API_KEY
```

### Obtaining an API Key

1. Log into the web application
2. Navigate to Settings → API Access
3. Click "Generate New API Key"
4. Store securely (shown only once)

### Rate Limiting

| Plan | Requests/Day | Requests/Minute | Concurrent |
|------|-------------|-----------------|------------|
| Free | 1,000 | 20 | 2 |
| Pro | 10,000 | 100 | 10 |
| Enterprise | Unlimited | 1,000 | 100 |

Rate limit headers included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid date format",
    "details": {
      "field": "start_date",
      "provided": "2024-13-45",
      "expected": "YYYY-MM-DD"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "request_id": "req_abc123"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `AUTH_REQUIRED` | 401 | Missing or invalid API key |
| `INSUFFICIENT_PERMISSIONS` | 403 | API key lacks required scope |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | Temporary outage |

## Endpoints

### Health Check

#### `GET /health`

Check API status and version.

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": "connected",
    "ai": "operational",
    "cache": "connected"
  }
}
```

---

### Transactions

#### `POST /api/upload`

Upload and process bank statements.

**Request:**
```http
POST /api/upload
Content-Type: multipart/form-data

file: [binary data]
format: "csv" | "pdf" | "json"
account_id: "acc_123" (optional)
date_format: "MM/DD/YYYY" (optional)
```

**Response:**
```json
{
  "upload_id": "upl_abc123",
  "status": "processing",
  "file_name": "statement.csv",
  "transactions_found": 150,
  "transactions_processed": 0,
  "estimated_time": 5
}
```

#### `GET /api/upload/:uploadId/status`

Check upload processing status.

**Response:**
```json
{
  "upload_id": "upl_abc123",
  "status": "completed",
  "transactions_processed": 150,
  "transactions_categorized": 145,
  "errors": [],
  "processing_time": 3.2,
  "results": {
    "new_transactions": 120,
    "duplicate_transactions": 30,
    "failed_transactions": 0
  }
}
```

#### `GET /api/transactions`

Retrieve transactions with filtering and pagination.

**Query Parameters:**
| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `start_date` | string | ISO date | 30 days ago |
| `end_date` | string | ISO date | Today |
| `category` | string | Category filter | All |
| `merchant` | string | Merchant filter | All |
| `min_amount` | number | Minimum amount | None |
| `max_amount` | number | Maximum amount | None |
| `account_id` | string | Account filter | All |
| `page` | number | Page number | 1 |
| `limit` | number | Items per page | 50 |
| `sort` | string | Sort field | date:desc |

**Response:**
```json
{
  "transactions": [
    {
      "id": "txn_abc123",
      "date": "2024-01-15",
      "description": "STARBUCKS #1234",
      "merchant": "Starbucks",
      "amount": -5.75,
      "category": "Coffee Shops",
      "account_id": "acc_123",
      "tags": ["recurring", "morning"],
      "notes": null,
      "created_at": "2024-01-15T08:30:00Z",
      "updated_at": "2024-01-15T08:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  },
  "summary": {
    "total_income": 5000.00,
    "total_expenses": -3500.00,
    "net": 1500.00,
    "transaction_count": 1250
  }
}
```

#### `GET /api/transactions/:id`

Get single transaction details.

**Response:**
```json
{
  "id": "txn_abc123",
  "date": "2024-01-15",
  "description": "STARBUCKS #1234",
  "merchant": "Starbucks",
  "amount": -5.75,
  "category": "Coffee Shops",
  "subcategory": "Coffee",
  "account_id": "acc_123",
  "tags": ["recurring", "morning"],
  "notes": null,
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "US"
  },
  "metadata": {
    "original_description": "STARBUCKS STORE #1234 SAN FRANCI",
    "import_id": "upl_xyz789",
    "confidence_score": 0.95
  }
}
```

#### `PUT /api/transactions/:id`

Update transaction details.

**Request:**
```json
{
  "category": "Business Meals",
  "tags": ["business", "client-meeting"],
  "notes": "Client lunch meeting"
}
```

**Response:**
```json
{
  "id": "txn_abc123",
  "updated_fields": ["category", "tags", "notes"],
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### `DELETE /api/transactions/:id`

Delete a transaction.

**Response:**
```json
{
  "id": "txn_abc123",
  "deleted": true,
  "deleted_at": "2024-01-15T10:30:00Z"
}
```

#### `POST /api/transactions/bulk`

Perform bulk operations on transactions.

**Request:**
```json
{
  "operation": "categorize",
  "transaction_ids": ["txn_123", "txn_456"],
  "data": {
    "category": "Entertainment"
  }
}
```

**Response:**
```json
{
  "updated": 2,
  "failed": 0,
  "results": [
    {"id": "txn_123", "success": true},
    {"id": "txn_456", "success": true}
  ]
}
```

---

### Analytics

#### `GET /api/analytics/summary`

Get financial summary for a period.

**Query Parameters:**
- `period`: "daily" | "weekly" | "monthly" | "yearly"
- `date`: Reference date (default: today)

**Response:**
```json
{
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "income": {
    "total": 5000.00,
    "sources": [
      {"source": "Salary", "amount": 4500.00},
      {"source": "Freelance", "amount": 500.00}
    ]
  },
  "expenses": {
    "total": 3500.00,
    "by_category": [
      {"category": "Housing", "amount": 1500.00, "percentage": 42.86},
      {"category": "Food", "amount": 600.00, "percentage": 17.14}
    ]
  },
  "net": 1500.00,
  "savings_rate": 30.0,
  "comparisons": {
    "previous_period": {
      "income_change": 5.2,
      "expense_change": -3.1,
      "net_change": 15.5
    },
    "year_over_year": {
      "income_change": 12.3,
      "expense_change": 8.7,
      "net_change": 18.2
    }
  }
}
```

#### `GET /api/analytics/trends`

Get spending trends over time.

**Query Parameters:**
- `start_date`: ISO date
- `end_date`: ISO date
- `grouping`: "daily" | "weekly" | "monthly"
- `categories`: Comma-separated list (optional)

**Response:**
```json
{
  "trends": [
    {
      "date": "2024-01",
      "income": 5000.00,
      "expenses": 3500.00,
      "net": 1500.00,
      "categories": {
        "Housing": 1500.00,
        "Food": 600.00,
        "Transportation": 400.00
      }
    }
  ],
  "statistics": {
    "average_income": 5000.00,
    "average_expenses": 3500.00,
    "highest_expense_month": "2024-01",
    "lowest_expense_month": "2024-03",
    "trend_direction": "decreasing",
    "volatility_score": 0.23
  }
}
```

#### `GET /api/analytics/categories`

Detailed category analysis.

**Response:**
```json
{
  "categories": [
    {
      "name": "Food & Dining",
      "total": 600.00,
      "percentage": 17.14,
      "transaction_count": 45,
      "average_transaction": 13.33,
      "subcategories": [
        {
          "name": "Groceries",
          "amount": 400.00,
          "percentage": 66.67
        },
        {
          "name": "Restaurants",
          "amount": 200.00,
          "percentage": 33.33
        }
      ],
      "top_merchants": [
        {"name": "Whole Foods", "amount": 250.00, "count": 8},
        {"name": "Chipotle", "amount": 75.00, "count": 5}
      ],
      "trend": "increasing",
      "month_over_month": 5.2
    }
  ]
}
```

#### `GET /api/analytics/forecast`

AI-powered financial forecasting.

**Query Parameters:**
- `months`: Number of months to forecast (1-12)

**Response:**
```json
{
  "forecast": [
    {
      "month": "2024-02",
      "predicted_income": 5100.00,
      "predicted_expenses": 3400.00,
      "predicted_net": 1700.00,
      "confidence": 0.85,
      "factors": [
        "Seasonal pattern detected",
        "Recurring expenses identified"
      ]
    }
  ],
  "warnings": [
    {
      "type": "cash_flow",
      "month": "2024-04",
      "message": "Potential cash flow issue due to annual insurance payment"
    }
  ],
  "recommendations": [
    "Increase emergency fund by $500 before April",
    "Consider spreading insurance payment monthly"
  ]
}
```

---

### AI Insights

#### `POST /api/insights/generate`

Generate AI-powered insights.

**Request:**
```json
{
  "focus_areas": ["subscriptions", "savings", "optimization"],
  "time_period": "last_3_months",
  "include_forecast": true
}
```

**Response:**
```json
{
  "insights": [
    {
      "id": "ins_abc123",
      "type": "subscription_audit",
      "priority": "high",
      "title": "Duplicate Streaming Services",
      "description": "You have 3 video streaming subscriptions",
      "details": {
        "services": ["Netflix", "Hulu", "Disney+"],
        "total_cost": 45.97,
        "recommendation": "Keep Netflix, cancel others",
        "potential_savings": 27.98
      },
      "action": {
        "type": "cancel_subscription",
        "providers": ["Hulu", "Disney+"],
        "estimated_impact": "Save $335.76/year"
      }
    },
    {
      "id": "ins_def456",
      "type": "spending_pattern",
      "priority": "medium",
      "title": "Weekend Spending Spike",
      "description": "Your weekend spending is 3x weekday average",
      "details": {
        "weekday_average": 25.00,
        "weekend_average": 75.00,
        "main_categories": ["Dining Out", "Entertainment"],
        "suggestion": "Plan weekend activities in advance"
      }
    }
  ],
  "summary": {
    "total_insights": 8,
    "high_priority": 2,
    "potential_monthly_savings": 185.50,
    "potential_yearly_savings": 2226.00
  }
}
```

#### `GET /api/insights/:id`

Get specific insight details.

**Response:**
```json
{
  "id": "ins_abc123",
  "type": "subscription_audit",
  "created_at": "2024-01-15T10:00:00Z",
  "status": "active",
  "user_action": null,
  "full_analysis": "...",
  "supporting_transactions": [...]
}
```

#### `POST /api/insights/:id/action`

Take action on an insight.

**Request:**
```json
{
  "action": "accept",
  "notes": "Cancelled Hulu and Disney+"
}
```

**Response:**
```json
{
  "id": "ins_abc123",
  "action_taken": "accept",
  "updated_at": "2024-01-15T11:00:00Z",
  "impact_tracking": {
    "enabled": true,
    "measurement_start": "2024-02-01"
  }
}
```

---

### Dashboard

#### `GET /api/dashboard`

Get complete dashboard data.

**Response:**
```json
{
  "summary_cards": {
    "income": 5000.00,
    "expenses": 3500.00,
    "net": 1500.00,
    "savings_rate": 30.0
  },
  "charts": {
    "spending_trend": [...],
    "category_breakdown": [...],
    "daily_spending": [...]
  },
  "recent_transactions": [...],
  "insights": [...],
  "alerts": [
    {
      "type": "bill_due",
      "message": "Credit card payment due in 3 days",
      "urgency": "high"
    }
  ]
}
```

#### `GET /api/dashboard/widgets/:widgetId`

Get specific dashboard widget data.

**Available Widgets:**
- `spending-chart`
- `category-pie`
- `monthly-comparison`
- `savings-progress`
- `bill-calendar`
- `investment-summary`

---

### Budgets

#### `GET /api/budgets`

Get all budgets.

**Response:**
```json
{
  "budgets": [
    {
      "id": "bud_abc123",
      "name": "Monthly Budget",
      "period": "monthly",
      "categories": [
        {
          "category": "Food",
          "limit": 600.00,
          "spent": 425.50,
          "remaining": 174.50,
          "percentage": 70.92
        }
      ],
      "total_limit": 3500.00,
      "total_spent": 2150.00,
      "status": "on_track"
    }
  ]
}
```

#### `POST /api/budgets`

Create a new budget.

**Request:**
```json
{
  "name": "Q1 Budget",
  "period": "quarterly",
  "categories": [
    {"category": "Food", "limit": 1800.00},
    {"category": "Entertainment", "limit": 600.00}
  ],
  "notifications": {
    "at_percentage": [50, 80, 100],
    "email": true,
    "push": true
  }
}
```

#### `PUT /api/budgets/:id`

Update budget settings.

#### `DELETE /api/budgets/:id`

Delete a budget.

---

### Reports

#### `POST /api/reports/generate`

Generate custom report.

**Request:**
```json
{
  "type": "monthly_summary",
  "period": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "include": ["transactions", "analytics", "insights"],
  "format": "pdf",
  "email_to": "user@example.com"
}
```

**Response:**
```json
{
  "report_id": "rpt_abc123",
  "status": "generating",
  "estimated_time": 30,
  "download_url": null
}
```

#### `GET /api/reports/:id/status`

Check report generation status.

**Response:**
```json
{
  "report_id": "rpt_abc123",
  "status": "completed",
  "download_url": "https://api.financetracker.io/reports/rpt_abc123/download",
  "expires_at": "2024-01-16T10:00:00Z"
}
```

---

### Settings

#### `GET /api/settings`

Get user settings.

**Response:**
```json
{
  "preferences": {
    "currency": "USD",
    "date_format": "MM/DD/YYYY",
    "week_starts": "sunday",
    "fiscal_year_start": "january"
  },
  "notifications": {
    "email": true,
    "push": true,
    "sms": false,
    "frequency": "daily"
  },
  "privacy": {
    "share_anonymous_data": true,
    "enable_ai_insights": true
  }
}
```

#### `PUT /api/settings`

Update user settings.

---

## Webhooks

Configure webhooks to receive real-time notifications.

### Webhook Events

| Event | Description |
|-------|-------------|
| `transaction.created` | New transaction added |
| `transaction.categorized` | Transaction auto-categorized |
| `insight.generated` | New AI insight available |
| `budget.exceeded` | Budget limit exceeded |
| `report.completed` | Report generation finished |

### Webhook Payload

```json
{
  "event": "transaction.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "transaction_id": "txn_abc123",
    "amount": -25.50,
    "merchant": "Amazon",
    "category": "Shopping"
  }
}
```

### Webhook Security

All webhooks include HMAC signature:

```http
X-Signature: sha256=abc123...
```

Verify with:
```javascript
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');
```

---

## SDKs & Libraries

### Official SDKs

- **JavaScript/TypeScript**: `npm install @financetracker/sdk`
- **Python**: `pip install financetracker-sdk`
- **Ruby**: `gem install financetracker`
- **Go**: `go get github.com/financetracker/go-sdk`

### Quick Start (JavaScript)

```javascript
import FinanceTracker from '@financetracker/sdk';

const client = new FinanceTracker({
  apiKey: 'YOUR_API_KEY',
  environment: 'production'
});

// Get transactions
const transactions = await client.transactions.list({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  category: 'Food'
});

// Generate insights
const insights = await client.insights.generate({
  focusAreas: ['subscriptions', 'savings']
});

// Upload statement
const upload = await client.uploads.create({
  file: fileBuffer,
  format: 'csv'
});
```

---

## Code Examples

### Python Example

```python
import financetracker

client = financetracker.Client(api_key="YOUR_API_KEY")

# Get monthly summary
summary = client.analytics.summary(period="monthly")
print(f"Net income: ${summary['net']}")

# Find subscriptions
insights = client.insights.generate(
    focus_areas=["subscriptions"]
)
for insight in insights["insights"]:
    if insight["type"] == "subscription_audit":
        print(f"Found subscription: {insight['title']}")
        print(f"Potential savings: ${insight['details']['potential_savings']}")
```

### cURL Examples

```bash
# Get transactions
curl -X GET "https://api.financetracker.io/api/transactions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"

# Upload CSV file
curl -X POST "https://api.financetracker.io/api/upload" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -F "file=@statement.csv" \
  -F "format=csv"

# Generate insights
curl -X POST "https://api.financetracker.io/api/insights/generate" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"focus_areas": ["subscriptions", "savings"]}'
```

---

## Best Practices

### Pagination

Always paginate large result sets:

```javascript
let allTransactions = [];
let page = 1;
let hasMore = true;

while (hasMore) {
  const response = await client.transactions.list({
    page: page,
    limit: 100
  });
  
  allTransactions.push(...response.transactions);
  hasMore = page < response.pagination.pages;
  page++;
}
```

### Error Handling

Implement exponential backoff for retries:

```javascript
async function makeRequest(url, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(r => setTimeout(r, Math.pow(2, i) * 1000));
    }
  }
}
```

### Caching

Cache frequently accessed data:

```javascript
const cache = new Map();

async function getCachedData(key, fetchFn) {
  if (cache.has(key)) {
    const { data, timestamp } = cache.get(key);
    if (Date.now() - timestamp < 300000) { // 5 minutes
      return data;
    }
  }
  
  const data = await fetchFn();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

---

## Migration Guide

### From v0.x to v1.0

Breaking changes:
1. Authentication header changed from `X-API-Key` to `Authorization: Bearer`
2. Date parameters now use ISO 8601 format
3. Renamed endpoints:
   - `/transactions/upload` → `/upload`
   - `/analytics/dashboard` → `/dashboard`

---

## Support

### Resources
- API Status: https://status.financetracker.io
- Community Forum: https://forum.financetracker.io
- GitHub Issues: https://github.com/financetracker/api/issues

### Contact
- Email: api-support@financetracker.io
- Discord: https://discord.gg/financetracker

---

*API Version: 1.0.0 | Last Updated: January 2025*