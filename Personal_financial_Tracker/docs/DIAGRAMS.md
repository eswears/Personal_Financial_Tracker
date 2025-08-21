# 📊 System Diagrams

## User Journey Flow

```mermaid
journey
    title User Financial Management Journey
    section Discovery
      Visit Website: 5: User
      Read Features: 4: User
      Try Demo: 5: User
    section Onboarding
      Sign Up: 4: User
      Connect Bank: 3: User
      Upload Statement: 5: User
    section Daily Use
      View Dashboard: 5: User
      Check Insights: 5: User
      Review Transactions: 4: User
      Set Budget: 4: User
    section Optimization
      Follow AI Advice: 5: User
      Cancel Subscriptions: 4: User
      Track Savings: 5: User
      Achieve Goals: 5: User
```

## Database Schema

```mermaid
erDiagram
    Users ||--o{ Accounts : has
    Users ||--o{ Transactions : owns
    Users ||--o{ Budgets : creates
    Users ||--o{ Insights : receives
    Users ||--o{ Reports : generates
    
    Accounts ||--o{ Transactions : contains
    Accounts {
        uuid id PK
        uuid user_id FK
        string name
        string type
        decimal balance
        timestamp created_at
    }
    
    Transactions ||--|| Categories : belongs_to
    Transactions {
        uuid id PK
        uuid user_id FK
        uuid account_id FK
        date transaction_date
        decimal amount
        string merchant
        string description
        uuid category_id FK
        boolean is_recurring
        timestamp created_at
    }
    
    Categories {
        uuid id PK
        string name
        string type
        string color
        string icon
    }
    
    Budgets ||--o{ BudgetCategories : includes
    Budgets {
        uuid id PK
        uuid user_id FK
        string name
        string period
        decimal total_limit
        timestamp created_at
    }
    
    BudgetCategories {
        uuid id PK
        uuid budget_id FK
        uuid category_id FK
        decimal limit_amount
        decimal spent_amount
    }
    
    Insights {
        uuid id PK
        uuid user_id FK
        string type
        json content
        string priority
        string status
        timestamp created_at
    }
    
    Reports {
        uuid id PK
        uuid user_id FK
        string type
        string format
        json filters
        string file_url
        timestamp created_at
    }
```

## State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Idle
    
    Idle --> Loading : User Action
    Loading --> Success : Data Fetched
    Loading --> Error : Request Failed
    
    Success --> Idle : Reset
    Success --> Updating : User Edit
    
    Error --> Idle : Retry
    Error --> Loading : Auto-Retry
    
    Updating --> Success : Update Complete
    Updating --> Error : Update Failed
    
    state Success {
        [*] --> DisplayingData
        DisplayingData --> Filtering : Apply Filter
        Filtering --> DisplayingData : Clear Filter
        DisplayingData --> Sorting : Change Sort
        Sorting --> DisplayingData : Sort Applied
    }
```

## CI/CD Pipeline

```mermaid
flowchart LR
    subgraph "Development"
        Dev[Developer] --> Commit[Git Commit]
        Commit --> PR[Pull Request]
    end
    
    subgraph "CI Pipeline"
        PR --> Lint[ESLint]
        Lint --> Tests[Jest Tests]
        Tests --> Build[Build App]
        Build --> E2E[E2E Tests]
        E2E --> Security[Security Scan]
    end
    
    subgraph "CD Pipeline"
        Security --> Staging[Deploy Staging]
        Staging --> StagingTests[Staging Tests]
        StagingTests --> Approval[Manual Approval]
        Approval --> Production[Deploy Production]
        Production --> Monitoring[Monitor]
    end
    
    style Dev fill:#4caf50
    style Tests fill:#2196f3
    style Production fill:#ff9800
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API
    participant Auth
    participant Database
    
    User->>Frontend: Enter Credentials
    Frontend->>API: POST /auth/login
    API->>Auth: Validate Credentials
    Auth->>Database: Check User
    Database-->>Auth: User Data
    Auth-->>API: Generate Tokens
    API-->>Frontend: Access + Refresh Token
    Frontend-->>User: Login Success
    
    Note over Frontend: Store tokens securely
    
    User->>Frontend: Access Protected Route
    Frontend->>API: Request + Access Token
    API->>Auth: Verify Token
    
    alt Token Valid
        Auth-->>API: Token Valid
        API-->>Frontend: Protected Data
        Frontend-->>User: Display Data
    else Token Expired
        Auth-->>API: Token Expired
        API-->>Frontend: 401 Unauthorized
        Frontend->>API: POST /auth/refresh
        API->>Auth: Validate Refresh Token
        Auth-->>API: New Access Token
        API-->>Frontend: New Access Token
        Frontend->>API: Retry Request
        API-->>Frontend: Protected Data
        Frontend-->>User: Display Data
    end
```

## Transaction Processing Pipeline

```mermaid
flowchart TD
    Start([File Upload]) --> Validate{Valid Format?}
    Validate -->|No| Error[Return Error]
    Validate -->|Yes| Queue[Add to Queue]
    
    Queue --> Process[Process File]
    Process --> Parse[Parse Transactions]
    Parse --> Dedupe[Remove Duplicates]
    
    Dedupe --> Categorize[AI Categorization]
    Categorize --> ML[ML Model]
    Categorize --> Rules[Rule Engine]
    
    ML --> Merge[Merge Results]
    Rules --> Merge
    
    Merge --> Enrich[Enrich Data]
    Enrich --> Save[(Save to DB)]
    
    Save --> Analytics[Update Analytics]
    Analytics --> Insights[Generate Insights]
    Insights --> Notify[Notify User]
    
    Notify --> End([Complete])
    Error --> End
    
    style Start fill:#4caf50
    style Error fill:#f44336
    style End fill:#2196f3
```

## Budget Tracking System

```mermaid
graph LR
    subgraph "Budget Setup"
        Create[Create Budget] --> Define[Define Categories]
        Define --> Limits[Set Limits]
        Limits --> Period[Set Period]
    end
    
    subgraph "Transaction Processing"
        NewTx[New Transaction] --> Check{Within Budget?}
        Check -->|Yes| Track[Update Tracking]
        Check -->|No| Alert[Send Alert]
        Alert --> Track
    end
    
    subgraph "Analysis"
        Track --> Calculate[Calculate Usage]
        Calculate --> Forecast[Forecast Spending]
        Forecast --> Recommend[AI Recommendations]
    end
    
    subgraph "Reporting"
        Recommend --> Daily[Daily Summary]
        Recommend --> Weekly[Weekly Report]
        Recommend --> Monthly[Monthly Analysis]
    end
    
    style Create fill:#4caf50
    style Alert fill:#ff9800
    style Recommend fill:#9c27b0
```

## Microservices Communication

```mermaid
graph TB
    subgraph "API Gateway"
        Gateway[Kong/Nginx]
    end
    
    subgraph "Core Services"
        Auth[Auth Service]
        Trans[Transaction Service]
        Analytics[Analytics Service]
        Insight[Insight Service]
    end
    
    subgraph "Message Queue"
        RabbitMQ[RabbitMQ/Redis]
    end
    
    subgraph "Shared Services"
        Cache[(Redis Cache)]
        DB[(PostgreSQL)]
        Storage[(S3 Storage)]
    end
    
    Gateway --> Auth
    Gateway --> Trans
    Gateway --> Analytics
    Gateway --> Insight
    
    Trans --> RabbitMQ
    RabbitMQ --> Analytics
    RabbitMQ --> Insight
    
    Auth --> Cache
    Trans --> DB
    Analytics --> DB
    Insight --> DB
    
    Trans --> Storage
    
    style Gateway fill:#ff9800
    style RabbitMQ fill:#4caf50
    style DB fill:#2196f3
```

## Performance Monitoring Dashboard

```mermaid
graph TD
    subgraph "Metrics Collection"
        App[Application] --> APM[APM Agent]
        APM --> Collector[Metrics Collector]
    end
    
    subgraph "Processing"
        Collector --> TimeSeries[(Time Series DB)]
        Collector --> Logs[(Log Storage)]
        Collector --> Traces[(Trace Storage)]
    end
    
    subgraph "Visualization"
        TimeSeries --> Grafana[Grafana]
        Logs --> Kibana[Kibana]
        Traces --> Jaeger[Jaeger]
    end
    
    subgraph "Alerting"
        Grafana --> AlertManager[Alert Manager]
        AlertManager --> Slack[Slack]
        AlertManager --> PagerDuty[PagerDuty]
        AlertManager --> Email[Email]
    end
    
    style App fill:#4caf50
    style Grafana fill:#ff9800
    style AlertManager fill:#f44336
```

## Data Privacy & Compliance

```mermaid
flowchart TD
    subgraph "Data Collection"
        User[User Data] --> Consent{Consent Given?}
        Consent -->|No| Minimal[Minimal Collection]
        Consent -->|Yes| Full[Full Collection]
    end
    
    subgraph "Processing"
        Full --> Encrypt[Encryption]
        Minimal --> Encrypt
        Encrypt --> Anonymize[Anonymization]
        Anonymize --> Process[Process Data]
    end
    
    subgraph "Storage"
        Process --> Secure[(Secure Storage)]
        Secure --> Retention{Retention Period?}
        Retention -->|Active| Keep[Keep Data]
        Retention -->|Expired| Delete[Delete Data]
    end
    
    subgraph "User Rights"
        Request[User Request] --> Type{Request Type}
        Type -->|Export| Export[Export Data]
        Type -->|Delete| Purge[Purge All Data]
        Type -->|Correct| Update[Update Data]
    end
    
    Secure -.-> Export
    Secure -.-> Purge
    Secure -.-> Update
    
    style User fill:#4caf50
    style Encrypt fill:#2196f3
    style Delete fill:#f44336
```

## Scaling Strategy

```mermaid
graph TB
    subgraph "Load Monitoring"
        Metrics[System Metrics] --> Threshold{Threshold Reached?}
    end
    
    subgraph "Horizontal Scaling"
        Threshold -->|CPU > 70%| ScaleOut[Add Instances]
        Threshold -->|CPU < 30%| ScaleIn[Remove Instances]
    end
    
    subgraph "Vertical Scaling"
        Threshold -->|Memory > 80%| UpSize[Increase Resources]
        Threshold -->|Memory < 20%| DownSize[Decrease Resources]
    end
    
    subgraph "Database Scaling"
        Threshold -->|DB Load| ReadReplica[Add Read Replicas]
        Threshold -->|Storage| Partition[Partition Tables]
    end
    
    ScaleOut --> LoadBalancer[Update Load Balancer]
    ScaleIn --> LoadBalancer
    ReadReplica --> ConnectionPool[Update Connection Pool]
    
    style Metrics fill:#9c27b0
    style ScaleOut fill:#4caf50
    style ScaleIn fill:#ff9800
```

## Error Handling Flow

```mermaid
stateDiagram-v2
    [*] --> Normal
    
    Normal --> Error : Exception Occurs
    
    Error --> Logged : Log Error
    Logged --> Categorized : Categorize Error
    
    Categorized --> UserError : User Error
    Categorized --> SystemError : System Error
    Categorized --> NetworkError : Network Error
    
    UserError --> DisplayMessage : Show User Message
    SystemError --> Alert : Alert DevOps
    NetworkError --> Retry : Auto Retry
    
    DisplayMessage --> [*]
    Alert --> Investigate : Manual Investigation
    Retry --> Normal : Success
    Retry --> SystemError : Max Retries
    
    Investigate --> Fix : Apply Fix
    Fix --> Normal : Resolved
```

## Feature Rollout Strategy

```mermaid
graph LR
    subgraph "Development"
        Feature[New Feature] --> Test[Testing]
        Test --> Ready[Ready for Release]
    end
    
    subgraph "Rollout Phases"
        Ready --> Internal[1% Internal Users]
        Internal --> Beta[5% Beta Users]
        Beta --> Limited[20% Users]
        Limited --> Half[50% Users]
        Half --> Full[100% Users]
    end
    
    subgraph "Monitoring"
        Internal --> Monitor1[Monitor Metrics]
        Beta --> Monitor2[Monitor Metrics]
        Limited --> Monitor3[Monitor Metrics]
        Half --> Monitor4[Monitor Metrics]
        Full --> Monitor5[Monitor Metrics]
    end
    
    subgraph "Rollback"
        Monitor1 --> Rollback{Issues?}
        Monitor2 --> Rollback
        Monitor3 --> Rollback
        Monitor4 --> Rollback
        Monitor5 --> Rollback
        Rollback -->|Yes| Previous[Previous Version]
        Rollback -->|No| Continue[Continue]
    end
    
    style Feature fill:#4caf50
    style Full fill:#2196f3
    style Rollback fill:#ff9800
```

---

*System Diagrams v1.0.0 | Last Updated: January 2025*