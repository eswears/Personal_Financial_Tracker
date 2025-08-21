# 📘 Personal Finance Tracker - User Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Uploading Transactions](#uploading-transactions)
4. [Understanding Categories](#understanding-categories)
5. [Analytics & Insights](#analytics--insights)
6. [Budget Management](#budget-management)
7. [Advanced Features](#advanced-features)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Mobile Access](#mobile-access)
10. [Data Export](#data-export)

## Getting Started

### First Launch
When you first open Personal Finance Tracker, you'll see our streamlined onboarding:

1. **Welcome Screen** - Click "Get Started" (no registration required)
2. **Quick Upload** - Drag your bank statement or click to browse
3. **Instant Analysis** - View categorized transactions in seconds
4. **AI Insights** - Get personalized recommendations immediately

### Account Setup (Optional)
While not required, creating an account enables:
- Data persistence across devices
- Historical tracking beyond 90 days
- Family member management
- API access for integrations

## Dashboard Overview

The dashboard is your financial command center, divided into key sections:

### 1. Financial Summary Cards
Located at the top, these cards provide at-a-glance metrics:

- **Income This Month**: Total deposits and earnings
- **Expenses This Month**: Total spending across all categories
- **Net Balance**: Income minus expenses
- **Savings Rate**: Percentage of income saved

Each card is clickable for detailed breakdowns.

### 2. Spending Trends Chart
Interactive line graph showing:
- 6-month spending history
- Category-specific trend lines
- Anomaly detection (unusual spikes/drops)
- Hover for exact amounts and dates

### 3. Category Breakdown
Pie chart visualization displaying:
- Spending distribution by category
- Percentage of total spending
- Click to filter transactions by category
- Double-click to see subcategories

### 4. Recent Transactions
Live feed of your latest transactions:
- Real-time categorization
- Merchant details
- Quick edit capabilities
- Search and filter options

### 5. AI Insights Panel
Smart recommendations including:
- Subscription audit results
- Savings opportunities
- Budget optimization tips
- Unusual spending alerts

## Uploading Transactions

### Supported File Formats

| Format | Extensions | Notes |
|--------|-----------|-------|
| **CSV** | .csv | Most common, all banks support |
| **PDF** | .pdf | Both text and scanned statements |
| **Excel** | .xls, .xlsx | Direct export from some banks |
| **QIF/OFX** | .qif, .ofx | Quicken/financial software formats |
| **JSON** | .json | API exports and custom formats |

### Upload Methods

#### Method 1: Drag and Drop
1. Open the Upload page
2. Drag files directly onto the drop zone
3. Files process automatically
4. View results immediately

#### Method 2: File Browser
1. Click "Browse Files" button
2. Select one or multiple files
3. Click "Upload"
4. Processing begins automatically

#### Method 3: Bank Connection (Premium)
1. Click "Connect Bank"
2. Select your bank from 5,000+ supported
3. Authenticate securely
4. Transactions sync automatically

### Processing Steps

1. **File Validation** - Format and structure check
2. **Data Extraction** - Parse transactions from file
3. **Duplicate Detection** - Prevent double-counting
4. **Auto-Categorization** - AI assigns categories
5. **Merchant Enhancement** - Clean up cryptic names
6. **Insight Generation** - AI analyzes patterns

### Handling Errors

Common issues and solutions:

| Error | Solution |
|-------|----------|
| "Unsupported format" | Convert to CSV or PDF |
| "No transactions found" | Check file contains data |
| "Duplicate transactions" | System auto-removes, no action needed |
| "Categorization failed" | Manual review required (rare) |

## Understanding Categories

### Default Categories

Personal Finance Tracker uses intelligent categories:

**Essential Expenses**
- Housing (Rent/Mortgage)
- Utilities
- Insurance
- Healthcare
- Debt Payments

**Daily Living**
- Groceries
- Transportation
- Personal Care
- Clothing
- Household Items

**Lifestyle**
- Dining Out
- Entertainment
- Hobbies
- Travel
- Subscriptions

**Financial**
- Savings
- Investments
- Income
- Transfers
- Fees

### Custom Categories

Create your own categories:

1. Go to Settings → Categories
2. Click "Add Custom Category"
3. Define:
   - Category name
   - Color code
   - Parent category (optional)
   - Keywords for auto-assignment
4. Save and apply to existing transactions

### Recategorization

Fix miscategorized transactions:

1. **Single Transaction**: Click category dropdown → Select new category
2. **Bulk Update**: Select multiple → Actions → Recategorize
3. **Create Rule**: Right-click → "Always categorize [Merchant] as [Category]"

### Smart Rules

Set up automatic categorization rules:

```
IF merchant_name CONTAINS "STARBUCKS"
THEN category = "Coffee Shops"

IF amount > 1000 AND merchant_name CONTAINS "RENT"
THEN category = "Housing"

IF day_of_week = "Saturday" AND category = "Groceries"
THEN tag = "Weekend Shopping"
```

## Analytics & Insights

### Spending Analysis

#### Monthly Comparison
- Current vs. previous month
- Year-over-year comparison
- Seasonal pattern detection
- Budget vs. actual spending

#### Category Deep Dive
Double-click any category to see:
- Transaction list
- Merchant breakdown
- Time-of-day patterns
- Payment method analysis

#### Trend Identification
AI automatically identifies:
- Increasing spend categories
- Decreasing spend categories
- New spending patterns
- Unusual transactions

### AI-Powered Insights

Our AI analyzes your data to provide:

#### Subscription Audit
- **Detection**: Finds all recurring charges
- **Analysis**: Identifies unused/duplicate services
- **Recommendations**: Suggests cancellations
- **Savings**: Shows potential monthly savings

Example insight:
> "You have 3 music streaming services totaling $35/month. Consider keeping only Spotify to save $25/month ($300/year)."

#### Spending Optimization
- **Pattern Recognition**: Identifies expensive habits
- **Alternatives**: Suggests cheaper options
- **Impact Calculation**: Shows long-term savings

Example insight:
> "Your daily coffee purchases average $186/month. Brewing at home could save $150/month ($1,800/year)."

#### Fee Detection
- **Bank Fees**: Overdraft, maintenance, ATM
- **Hidden Charges**: Service fees, tips, surcharges
- **Avoidance Strategies**: How to eliminate fees

#### Budget Recommendations
Based on your income and goals:
- 50/30/20 rule application
- Category-specific targets
- Savings rate optimization
- Emergency fund planning

### Forecasting

AI predicts future finances:

1. **Cash Flow Projection**: Next 3-6 months
2. **Bill Predictions**: Upcoming recurring charges
3. **Savings Trajectory**: Progress toward goals
4. **Risk Alerts**: Potential shortfalls

## Budget Management

### Creating a Budget

1. Click "Budgets" in navigation
2. Choose budget type:
   - **Zero-based**: Every dollar assigned
   - **50/30/20**: Needs/Wants/Savings
   - **Custom**: Your own percentages
3. Set category limits
4. Enable notifications

### Budget Tracking

Real-time budget monitoring:

- **Progress Bars**: Visual spending indicators
- **Alerts**: When approaching limits
- **Projections**: End-of-month estimates
- **Recommendations**: AI adjustment suggestions

### Smart Budgeting

AI helps optimize your budget:

1. **Analysis**: Reviews 3-month history
2. **Recommendations**: Suggests realistic limits
3. **Optimization**: Identifies savings opportunities
4. **Monitoring**: Alerts for unusual spending

## Advanced Features

### Multi-Account Management

Track multiple accounts:

1. Add accounts via Settings
2. View consolidated or separate
3. Transfer detection and exclusion
4. Net worth calculation

### Family Tracking

For household finances:

1. **Individual Profiles**: Track per person
2. **Shared Expenses**: Split bills automatically
3. **Allowances**: Set spending limits
4. **Reports**: Individual and combined

### Goal Setting

Financial goal tracking:

1. Set goal (vacation, emergency fund, etc.)
2. Define target amount and date
3. Track progress automatically
4. Get savings recommendations

### Investment Tracking

Monitor investment accounts:

- Portfolio performance
- Asset allocation
- Dividend tracking
- Tax implications

### Bill Management

Never miss a payment:

1. **Bill Detection**: Auto-identifies bills
2. **Due Date Tracking**: Calendar integration
3. **Payment Reminders**: Email/SMS alerts
4. **Auto-Pay Setup**: Through bank connection

## Keyboard Shortcuts

Power user shortcuts for efficiency:

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Upload transactions |
| `Ctrl+D` | Go to dashboard |
| `Ctrl+I` | View insights |
| `Ctrl+B` | Budget overview |
| `Ctrl+E` | Export data |
| `Ctrl+F` | Search transactions |
| `Ctrl+N` | Add manual transaction |
| `Ctrl+R` | Refresh data |
| `Ctrl+S` | Save changes |
| `Ctrl+,` | Open settings |
| `Esc` | Close modal/dialog |
| `?` | Show help |

### Transaction Shortcuts

When viewing transactions:

| Key | Action |
|-----|--------|
| `E` | Edit selected |
| `C` | Change category |
| `D` | Delete selected |
| `Space` | Select/deselect |
| `A` | Select all |
| `↑/↓` | Navigate list |

## Mobile Access

### Progressive Web App

Install on your phone:

**iOS**:
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Android**:
1. Open in Chrome
2. Tap menu (⋮)
3. Select "Add to Home Screen"

### Mobile Features

Optimized for touch:
- Swipe to categorize
- Pinch to zoom charts
- Pull to refresh
- Quick add transaction
- Camera receipt capture

### Offline Mode

Continue working without internet:
- View cached data
- Add transactions
- Edit categories
- Syncs when connected

## Data Export

### Export Formats

| Format | Use Case |
|--------|----------|
| **CSV** | Excel, spreadsheets |
| **PDF** | Reports, taxes |
| **JSON** | API, integrations |
| **QIF** | Quicken import |

### Export Options

1. **Full Export**: All data
2. **Date Range**: Specific period
3. **Categories**: Selected categories only
4. **Tax Report**: Tax-relevant only

### Automated Reports

Schedule regular exports:

1. Go to Settings → Automation
2. Set schedule (weekly/monthly)
3. Choose format and filters
4. Add email recipients

### API Access

For developers and integrations:

1. Generate API key in Settings
2. Use RESTful endpoints
3. Rate limits: 1000 calls/day
4. Full documentation at `/docs/api`

## Tips & Best Practices

### Daily Habits
- Review transactions daily (2 min)
- Correct miscategorizations immediately
- Check for duplicate transactions

### Weekly Review
- Analyze spending trends
- Review AI insights
- Adjust budget if needed
- Plan upcoming expenses

### Monthly Tasks
- Deep dive into categories
- Review subscriptions
- Export for records
- Set next month's goals

### Security Tips
- Enable two-factor authentication
- Use strong passwords
- Review connected accounts
- Check login history regularly

## Troubleshooting

### Common Issues

**Transactions not appearing**
- Check upload completed
- Verify date range filter
- Look for duplicates removed

**Wrong categorization**
- Create custom rules
- Train AI with corrections
- Check merchant variations

**Sync issues**
- Verify bank connection
- Check credentials
- Review error logs

**Performance problems**
- Clear browser cache
- Check internet speed
- Reduce date range

### Getting Help

1. **In-app Help**: Click ? icon
2. **Documentation**: docs.financetracker.io
3. **Community**: forum.financetracker.io
4. **Support**: support@financetracker.io

---

*Last updated: January 2025 | Version 1.0.0*