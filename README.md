# RecoverOps — AI-Assisted Revenue Recovery Agent

RecoverOps is a full-stack revenue recovery system that identifies revenue at risk from failed payments and abandoned checkouts, analyzes customer context, selects an appropriate recovery action, simulates the recovery attempt, and tracks the resulting outcome.

The project combines a deterministic decision pipeline with an on-demand Groq-powered AI explanation layer. The LLM does not make recovery decisions — it explains decisions already made by the recovery agent and generates customer-friendly recovery messages.

---

## Features

### Revenue Risk Detection

Automatically identifies revenue-at-risk events such as:

- Payment failures
- Checkout abandonment

The Risk Detector evaluates the event and determines:

- Risk type
- Amount at risk
- Risk level
- Failure cause
- Recoverability

### Customer Analysis

Customer context is analyzed using information such as:

- Previous purchases
- Total spending
- Customer lifetime value
- Average order value
- New vs returning customer
- Current transaction value

This context helps the system determine the importance and recoverability of each transaction.

### Deterministic Recovery Decision Agent

The Decision Agent selects an appropriate recovery strategy using predefined business rules.

Possible actions include:

- `REQUEST_PAYMENT_METHOD_UPDATE`
- `RETRY_PAYMENT`
- `SEND_PAYMENT_REMINDER`
- `SEND_CHECKOUT_REMINDER`
- `OFFER_DISCOUNT`
- `ESCALATE_TO_SUPPORT`
- `NO_ACTION`

The LLM does **not** choose or override these actions.

### Recovery Simulation

Selected recovery actions are executed through a simulation layer.

The simulator determines whether the recovery attempt succeeds or fails and calculates:

- Revenue recovered
- Revenue lost
- Recovery result
- Action taken

> This project simulates recovery outcomes and does not perform real payment processing or contact customers.

### Recovery Tracking

Recovery attempts are persisted in SQLite, allowing the application to track:

- Pending recoveries
- Successful recoveries
- Failed recoveries
- Revenue recovered
- Revenue lost
- Recovery actions

### Groq AI Assistant

Groq is integrated as an **on-demand explanation layer**.

When the user selects **Generate AI Insight**, the system provides Groq with the deterministic decision and the latest recovery outcome.

The AI generates:

- Internal recovery explanation
- Key decision factors
- Customer-facing message
- Subject
- Tone
- Recommended communication channel

The AI understands different recovery states:

- Pending
- Recovered
- Failed
- No recovery required

Customer-facing output is validated to prevent internal system terminology from being exposed.

---

## Agent Workflow

```text
Transaction Event
       │
       ▼
┌──────────────────────┐
│    Risk Detector     │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Customer Analyzer   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    Decision Agent    │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Recovery Simulator   │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│  Recovery Tracking   │
└──────────────────────┘

          On Demand
              │
              ▼
┌──────────────────────┐
│ Groq AI Explanation  │
└──────────────────────┘
```

The deterministic pipeline remains responsible for recovery decisions and outcomes. Groq is used only for explanation and customer-facing content generation.

---

## Dashboard

The dashboard provides an overview of the revenue recovery system, including:

- Revenue at risk
- Revenue recovered
- Recovery rate
- Transactions requiring recovery
- Risk distribution
- Recent agent activity

---

## Application Pages

### Dashboard

High-level overview of recovery performance and revenue metrics.

### Transactions

Browse and filter transaction events by:

- Event type
- Risk level
- Recovery status
- Transaction/customer search

Transactions are loaded using server-side pagination for improved performance.

### Transaction Intelligence

Provides a detailed view of an individual transaction, including:

- Transaction information
- Risk analysis
- Customer analysis
- Recovery decision
- Recovery result
- AI-generated explanation
- Agent reasoning timeline

### Recovery Center

Displays transactions grouped by recovery state:

- Needs Recovery
- Recovered
- Failed

Individual recovery actions or batch recovery simulation can be executed from the recovery workflow.

### Customers

Displays customer-level information including:

- Purchase history
- Total spending
- Customer lifetime value
- Average order value
- Risk events
- Recovered revenue

### Analytics

Provides recovery analytics including:

- Revenue recovery trends
- Failure reason distribution
- Recovery action success rates
- Risk distribution

### Agent Activity

Provides visibility into recent recovery decisions and actions performed by the system.

### Settings

Displays the current recovery-agent configuration, risk thresholds, simulation settings, and AI provider configuration.

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Recharts
- Lucide React
- CSS

### Backend

- Python
- Flask
- Flask-CORS
- SQLite
- NumPy

### AI

- Groq API
- `openai/gpt-oss-20b`

---

## Project Structure

```text
Revenue-recovery-agent/
│
├── backend/
│   ├── app.py
│   ├── config.py
│   ├── recovery_revenue.db
│   │
│   ├── services/
│   │   ├── risk_detector.py
│   │   ├── customer_analyzer.py
│   │   ├── decision_agent.py
│   │   ├── recovery_simulator.py
│   │   ├── recovery_tracker.py
│   │   ├── batch_processor.py
│   │   └── llm_service.py
│   │
│   ├── generate_data.py
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

### Database Configuration

Database configuration is centralized in `backend/config.py`:

```python
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, "recovery_revenue.db")
```

This keeps the database path portable and avoids machine-specific absolute paths.
---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Dashboard metrics |
| `GET` | `/api/transactions` | Paginated transaction list |
| `GET` | `/api/transactions/:id` | Transaction intelligence |
| `GET` | `/api/customers` | Paginated customer list |
| `GET` | `/api/recoveries` | Recovery Center data |
| `GET` | `/api/analytics` | Recovery analytics |
| `GET` | `/api/agent-activity` | Recent agent activity |
| `GET` | `/api/settings` | Agent configuration |
| `POST` | `/api/events` | Process a transaction event |
| `POST` | `/api/recovery/:id/execute` | Execute simulated recovery |
| `POST` | `/api/recovery/batch` | Execute batch recovery |
| `POST` | `/api/transactions/:id/ai` | Generate on-demand AI insight |

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd Revenue-recovery-agent
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create and activate a virtual environment.

Windows:

```bash
python -m venv venv
venv\Scripts\activate
```

Install the required Python packages:

```bash
pip install flask flask-cors numpy python-dotenv groq
```

Create a `.env` file inside the backend directory:

```env
GROQ_API_KEY=your_groq_api_key
```

Start the Flask server:

```bash
python app.py
```

The backend runs by default at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local frontend URL in the terminal.

---

## Environment Variables

The application requires the following environment variable:

```env
GROQ_API_KEY=your_groq_api_key
```

Do not commit the `.env` file to GitHub.

Make sure `.env` is included in `.gitignore`.

---

## Recovery Logic

The system separates deterministic decision-making from generative AI.

```text
Deterministic Components
        │
        ├── Risk Detection
        ├── Customer Analysis
        ├── Recovery Action Selection
        └── Recovery Simulation
                 │
                 ▼
           Stored Outcome
                 │
                 ▼
        On-Demand Groq Layer
                 │
                 ├── Explanation
                 └── Customer Message
```

This design ensures that an LLM cannot independently modify recovery actions or recovery outcomes.

---

## AI Safety and Output Validation

Customer-facing AI content is separated from internal recovery explanations.

The system prevents internal terminology such as:

- Decision-agent implementation details
- Recovery action enums
- Priority classifications
- Customer-value classifications
- Recoverability classifications
- Simulation terminology

from being exposed in customer-facing recovery messages.

If generated content contains internal terminology, a deterministic fallback message is used.

---

## Current Scope

RecoverOps is a prototype/academic project demonstrating an intelligent revenue recovery workflow.

The current implementation:

- Detects revenue risk
- Analyzes customer context
- Selects recovery strategies
- Simulates recovery outcomes
- Tracks recovery results
- Provides dashboard and analytics views
- Generates on-demand AI explanations

It does **not**:

- Process real payments
- Retry real payment-provider transactions
- Send real emails or notifications
- Modify real customer payment methods
- Integrate with a production payment gateway

These actions are simulated for demonstration purposes.

---

## Future Improvements

Possible extensions include:

- Stripe or Razorpay sandbox integration
- Real notification/email delivery
- Background recovery queues
- Authentication and role-based access
- Configurable recovery rules
- Persistent AI insight history
- Production database support
- Deployment and monitoring

---

## Author

**Bhoomi Yadav**

---

## License

This project is intended for educational and portfolio purposes.