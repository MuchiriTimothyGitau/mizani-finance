# mizani-finance

Cash-flow risk analysis for Kenyan SMEs. Upload a bank CSV, get a risk score, AI report, and record payments on-chain (Avalanche Fuji testnet).

## Architecture

```
mizani-deploy/
├── contracts/              # Solidity: PaymentLog contract
│   └── PaymentLog.sol      #   Emits PaymentRecorded events (Fuji)
├── functions/              # Appwrite Cloud Functions
│   ├── config/index.js     #   Combined: config, scoring engine, on-chain payments
│   ├── generate-report/    #   AI report via DeepSeek
│   ├── score-csv/          #   (stub) standalone scoring
│   └── onchain-payments/   #   (stub) standalone payment fetcher
├── scripts/                # Deployment & interaction scripts
│   ├── deploy.js           #   Deploy PaymentLog to Fuji
│   ├── deploy-functions.js #   Deploy Appwrite functions
│   ├── castPayment.js      #   Record a payment on-chain
│   └── readPayments.js     #   Query past PaymentRecorded events
├── test/
│   ├── PaymentLog.test.js  # Hardhat contract tests
│   └── unit/               # Node test runner unit tests
│       ├── scorer.test.js
│       └── generate-report.test.js
└── deployments/            # Deployed contract artifacts
    └── PaymentLog.json
```

**Frontend** → Vite + React SPA served via Vercel. Calls Appwrite functions through a serverless proxy.

## Prerequisites

- Node.js 22+
- npm
- For contract deployment: a Fuji RPC URL and a funded private key
- For Appwrite functions: an Appwrite project ID and API key
- For AI reports: a DeepSeek API key

## Setup

```bash
npm install
cp .env.example .env    # fill in your keys
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run compile` | Compile Solidity contracts (Hardhat) |
| `npm test` | Run Hardhat contract tests |
| `npm run test:unit` | Run JS unit tests (Node `--test`) |
| `npm run test:all` | Run all tests |
| `npm run deploy` | Deploy PaymentLog contract to Fuji |
| `npm run deploy:functions` | Deploy Appwrite cloud functions |
| `npm run deploy:frontend` | Build frontend + deploy to Vercel |

## Scoring Engine

The core scoring logic lives in `functions/config/index.js` and analyzes CSV transaction data:

- **Burn rate** – average monthly cash outflow
- **Runway** – months until cash runs out (adjusted for on-chain payments)
- **Risk flags** – concentration risk, burn acceleration, stale inflow, round-number withdrawals
- **Risk level** – `low` / `medium` / `high`

## Contract

`PaymentLog` (Avalanche Fuji testnet, chainId 43113)

| Field | Value |
|---|---|
| Address | `0xa786fEB386e44F13bE7bA33A1EEf28CCbcFb2Eef` |
| Explorer | [Snowtrace](https://testnet.snowtrace.io/address/0xa786fEB386e44F13bE7bA33A1EEf28CCbcFb2Eef) |

## Deployment

Active development is on `dev`. The `main` branch holds the latest verified deployment.
