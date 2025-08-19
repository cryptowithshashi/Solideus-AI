# Solideus AI: AI-powered Smart Contract Generator with Security Auditing

<img width="4000" height="2250" alt="Image" src="https://github.com/user-attachments/assets/137113a2-c32e-42f2-948b-ec9cf45f29da" />

Solideus AI converts natural-language specifications into Solidity smart contracts, runs automated static analysis, and provides an interactive playground for developers to iterate and deploy on the Sepolia testnet. The system blends large-language model generation (Gemini) with classical analysis tools (Slither) and developer workflows (Hardhat, ethers.js).

Solideus AI's novelty is in its end-to-end safety-focused pipeline: generate Solidity from language prompts, automatically run a security audit (Slither + AI-assisted review), store provenance on IPFS (Pinata), and offer a one-click deploy to Sepolia via Hardhat + Alchemy, all while keeping a clear, auditable trail and warnings around private keys and production usage.


## Table of Contents

- [Features](#features)

- [Demo / Screenshots](#demo--screenshots)

- [Architecture](Architecture)

- [Repository Structure](RepositoryStructure)

- [Getting Started - Quick Setup](#GettingStarted-QuickSetup)

  - .env.example

  - Security notes

- Backend — Detailed Setup & API

   - Slither integration

- Frontend — Detailed Setup

- Deployment (Render & Vercel)

- Testing & QA

- Security & Privacy

- Troubleshooting

- Roadmap / Future Work

- Contributing

- License

- Acknowledgments & References

- Appendix — FAQ & Contact / Security Reporting


## Features

- Natural language → Solidity generation powered by Gemini (LLM).

- Automated security audit: Slither static analysis + AI-assisted review report.

- One-click deployment to Sepolia (Hardhat + Alchemy).

- Automatic verification link generation for Etherscan (Sepolia).

- IPFS provenance & storage via Pinata.

- Interactive playground: compile/run with ethers.js, wallet via RainbowKit/wagmi.

- Safe-by-default: deployment gated behind an audit; warnings about private keys and mainnet usage.   

## Demo / Screenshots

<img width="4000" height="2250" alt="Image" src="https://github.com/user-attachments/assets/84f20346-c55d-45df-bc60-5f4062eb2ffe" />


## Architecture

<img width="4000" height="2250" alt="Image" src="https://github.com/user-attachments/assets/433e37b4-06c6-4d7c-aac6-29bb398e7ae5" />

- Solideus AI is split into three logical layers:

- Frontend (Next.js):  UI, wallet, playground, and calls to backend API.

- Backend (Node.js + Express): orchestrates Gemini calls, Slither audits,
  - Pinata uploads, Hardhat scripts, and Alchemy interactions.

- External services:  Gemini (LLM), Slither (static analysis), Pinata (IPFS),
   - Alchemy (RPC to Sepolia), Etherscan (verification / viewing).





## Repository Structure

```bash
solideus-ai/
├─ frontend/                 # Next.js app (UI)
│  ├─ pages/
│  ├─ components/
│  ├─ styles/
│  └─ package.json
├─ backend/                  # Express API + Hardhat + scripts
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ services/
│  │  ├─ hardhat/            # hardhat project folder (contracts, scripts)
│  │  └─ index.js
│  ├─ package.json
│  └─ tsconfig.json?         # optional
├─ shared/                   # shared types and utils
├─ docs/
│  └─ screenshots/
├─ .env.example
├─ README.md
└─ CONTRIBUTING.md
```



## Getting Started - Quick Setup

> These steps assume a UNIX-like environment (Linux/macOS). For Windows, use WSL or adapt commands.

### 1. Clone the repo:

```bash
git clone https://github.com/cryptowithshashi/solideus-ai.git
cd solideus-ai
```

### 2. Backend install & dev:

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend install & dev (new shell):

```bash
cd ../frontend
npm install
```

```bash
npm install
```

### .env.example

```bash
GEMINI_API_KEY=your-gemini-api-key
ALCHEMY_API_URL=https://eth-sepolia.g.alchemy.com/v2/your-key
PRIVATE_KEY=0x...
PINATA_API_KEY=your-pinata-key
PINATA_API_SECRET=your-pinata-secret
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

## Backend: Detailed Setup & API

The backend exposes a small REST API performing generation, auditing, storage, and deployment.

### 1. Install & Run (Development)

```bash
cd backend
npm install
npm run dev
npm run start:dev
```

### 2. Install & Run (Production)

```bash
cd backend
npm ci
npm run build 
npm run start
```
> Set environment variables in render or with systemd/etc.

## Hardhat setup

- Hardhat lives under backend/src/hardhat or backend/hardhat.

```bash
cd backend
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network sepolia
```

- Add OpenZeppelin if missing:

```bash
npm install --save-dev @openzeppelin/contracts
```

## API Endpoints

All endpoints are hosted under POST on the backend base URL:

### 1. POST /generate-contract

Request:

```bash
{
  "prompt": "A simple escrow contract: buyer sends funds, seller ships, buyer confirms to release funds, 7-day dispute window"
}
```

cURL

```bash
curl -X POST $API_BASE_URL/generate-contract \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Your natural language spec here"}'
```

Fetch (JavaScript)

```bash
const res = await fetch(`${API_BASE_URL}/generate-contract`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ prompt })
});
const data = await res.json();
```

Sample response

```bash
{
  "status": "ok",
  "solidity": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ncontract Escrow { ... }",
  "metadata": {
    "source": "gemini",
    "prompt_summary": "escrow: buyer funds, release on confirm, 7d dispute"
  }
}
```

### 2. POST /audit-contract

Request:

```bash
{
  "code": "// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0; ..."
}
```

cURL

```bash
curl -X POST $API_BASE_URL/audit-contract \
  -H "Content-Type: application/json" \
  -d '{"code":"<solidity code here>"}'
```

Sample response

```bash
{
  "status": "ok",
  "slither_report": "INFO: ...\nHIGH: Reentrancy possible in transfer() ...",
  "ai_review": {
    "summary": "Potential reentrancy and unchecked external call. Recommend using checks-effects-interactions.",
    "confidence": 0.78
  }
}
```


### 3. POST /deploy-contract

Request:

```bash
{
  "code": "// ... solidity ...",
  "constructorArgs": []
}
```

cURL

```bash
curl -X POST $API_BASE_URL/deploy-contract \
  -H "Content-Type: application/json" \
  -d '{"code":"...","constructorArgs":[]}'
```

Sample response (successful)

```bash
{
  "status": "ok",
  "txHash": "0xabc123...",
  "contractAddress": "0xdef456...",
  "network": "sepolia",
  "etherscanUrl": "https://sepolia.etherscan.io/address/0xdef456"
}
```

Sample response (error)

```bash
{
  "status": "error",
  "message": "Insufficient funds in deployer wallet."
}
```

### 4. POST /store-contract

Request:

```bash
{
  "code": "// ...",
  "metadata": {
    "prompt": "...",
    "author": "example",
    "notes": "generated on 2025-08-19"
  }
}
```

cURL

```bash
curl -X POST $API_BASE_URL/store-contract \
  -H "Content-Type: application/json" \
  -d '{"code":"...","metadata":{...}}'
```


Sample response

```bash
{
  "status":"ok",
  "ipfsHash":"QmAbc123...",
  "pinataUrl":"https://gateway.pinata.cloud/ipfs/QmAbc123"
}
```



## How the backend triggers Slither

Slither is a Python tool; the backend runs it by invoking a shell command and capturing stdout/stderr.

### Install Slither (Ubuntu)

- prerequisites

```bash
sudo apt-get update
sudo apt-get install -y python3 python3-pip build-essential
```
- install slither

```bash
pip3 install slither-analyzer
```
> or use pipx if preferred

### macOS (with Homebrew + pip)

```bash
brew install python3
pip3 install slither-analyzer
```

### Run Slither locally

```bash
cd backend/src/hardhat
slither contracts --json out/slither-report.json
slither contracts --print human-summary
```

### The backend should call something like:

```bash
slither /path/to/contracts --json /tmp/slither-report.json
```

> and then read /tmp/slither-report.json to build the slither_report field returned to clients.

## Frontend: Detailed Setup

### 1. Install and run:

```bash
cd frontend
npm install
npm run dev
```

### 2. Set NEXT_PUBLIC_API_BASE_URL (example .env.local):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8787
```

### 3. Wallet connection:

- Uses wagmi + RainbowKit.

- On load, users will be prompted to connect a wallet (MetaMask, Coinbase Wallet, etc.).

- The playground page allows connecting a wallet to sign transactions for the deploy flow.

- The UI will never ask you to paste your private key — the private key is only used server-side for deploy (and should be ephemeral/testnet only).

### 4. Pages mapping:

- `/` — Home / Overview

- `/playground` — prompt input to call `POST /generate-contract`

- `/audit` — displays `POST /audit-contract` results

- `/deploy` — step to deploy with `POST /deploy-contract`

- `/store` — optional metadata storage calling `POST /store-contract`



### 5. Example Axios fetch from frontend:

```bash
import axios from 'axios';
const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL });

async function generateContract(prompt) {
  const res = await api.post('/generate-contract', { prompt });
  return res.data;
}
```

## Deployment

### Backend → Render (Web Service)

- Create a new Web Service on Render.

- Connect GitHub repo `solideus-ai` and choose `backend` folder as the deploy root (or monorepo settings).

- Build & Start commands (example):

   - Build Command: `cd backend && npm ci && npm run build`

   - Start Command: `cd backend && npm run start`

   - If there is no build step: `cd backend && npm ci && node src/index.js`

- Environment (set as Render secrets):

   - GEMINI_API_KEY

   - ALCHEMY_API_URL

   - PRIVATE_KEY (testnet only)

   - PINATA_API_KEY

   - PINATA_API_SECRET

   - NEXT_PUBLIC_API_BASE_URL (optional for server-side rendering)

- Health checks: set a root /health endpoint returning 200.

> Important: Use Render secret management to store private values. Rotate keys immediately if exposed.

## Frontend → Vercel

- Import project into Vercel and point framework to the `frontend` directory.

- Set Environment Variables on Vercel:

   - NEXT_PUBLIC_API_BASE_URL → `https://your-backend.onrender.com`

- Build settings: Next.js (Vercel auto-detects).

- Deploy. Ensure preview deployments are tested against a dev backend.

## Testing & QA

- Hardhat tests

```bash
cd backend
npx hardhat test
```

- Unit tests (if present) — run from root or per-package:

```bash
npm run test
```


- Manual integration flow (locally):

      1. Start backend (npm run dev) and frontend (npm run dev).

      2. In playground: create a contract prompt → generate → audit → deploy.

      3. Deploy step sends a transaction to Sepolia via Alchemy. Expect 30s–3min depending on network.

- Gas notes: Sepolia uses low fees, but allocate sufficient gas in Hardhat config and account for network variance.

### Example test prompt

```bash
"A simple ERC20 token named TestToken with mint function restricted to owner and 18 decimals."
```

### Expected minimal solidity snippet

```bash
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TestToken is ERC20, Ownable {
  constructor(uint256 initialSupply) ERC20("TestToken","TTK") {
    _mint(msg.sender, initialSupply);
  }
  function mint(address to, uint256 amount) external onlyOwner {
    _mint(to, amount);
  }
}
```

## Security & Privacy

- Never keep private keys in Git. Use Render/Vercel secrets UI.

- Use ephemeral Sepolia keys for demos. Do not use mainnet keys.

- Secrecy rotation: remove old PRIVATE_KEY from Render, add new secret, and redeploy.

- Audit guidance: AI + Slither findings are advisory. Always perform manual code review and consider formal audits before mainnet deployment.

- Privacy: prompts submitted to Gemini are sent to LLM provider; do not paste sensitive private keys or secrets in prompts.


## Troubleshooting

### Slither not installed

- Error: slither: `command not found`

   - Solution: install `pip3 install slither-analyzer` and ensure `~/.local/bin` is on PATH.

### npx hardhat compile fails (missing OpenZeppelin)

- Error: `Cannot find '@openzeppelin/contracts'`

   - Solution: `npm i @openzeppelin/contracts` inside the hardhat project.

### Alchemy rate limit / 429

- Back off, check Alchemy dashboard for limits, or switch to a higher plan for heavier usage.

### Pinata upload errors (403 / 401)

- Ensure `PINATA_API_KEY` and `PINATA_API_SECRET` are correct and active. Confirm the Pinata account has not been suspended.

### Insufficient funds on deploy

- Ensure the `PRIVATE_KEY` used has Sepolia ETH. Use faucets to fund testnet wallets


## Roadmap / Future Work

- Multi-model support (Gemini + open-source models).

- On-prem LLM running (Ollama integration).

- Mainnet gating for paid users and billing/payment integration.

- Advanced static & symbolic analysis + fuzzing.

- Community templates marketplace and verified contract templates.

- User accounts and governance for community-curated templates.

## Contributing

We welcome contributions!

- Fork the repository and create a topic branch: `feat/<short-description>` or `fix/<short-description>.`

- Run tests (`npx hardhat test`) before opening PRs.

- Write clear commit messages and link to issues.

- PRs must include unit tests or updated docs if behaviour changes.

- Maintainers will review and request changes as necessary.


## License

This project is licensed under the MIT License — see the `LICENSE` file for details.

```bash
MIT License

Copyright (c) 2025 Solideus Ai

Permission is hereby granted, free of charge, to any person obtaining a copy
...
(standard MIT license text)
```

## Acknowledgments & References

- OpenZeppelin — https://docs.openzeppelin.com

- Hardhat — https://hardhat.org

- Slither — https://github.com/crytic/slither

- Etherscan — https://etherscan.io

- (Sepolia explorer: https://sepolia.etherscan.io
)

- Gemini (LLM) — provider docs (insert link to your account docs)

- Pinata (IPFS) — https://pinata.cloud/docs

- Alchemy — https://docs.alchemy.com

## Appendix — FAQ & Contact

Q: Can I use mainnet for deployments?

A: Not recommended. This project is for testnet & dev demos. If you plan mainnet usage, get formal audits and use production-grade secret management.

Q: Does Solideus AI guarantee secure contracts?

A: No. The audit is advisory. AI & Slither can find issues but cannot guarantee absence of vulnerability.

Q: How do I report a security vulnerability?

A: Email solideus@example.com with steps to reproduce. Don't include private keys.

Q: How do I rotate the deployer private key?

A: Remove the secret from Render, add a new secret, and redeploy. Revoke old keys at your wallet provider if possible.

## Final Notes

This README is intended to be self-contained and enable a competent developer or researcher to set up Solideus AI locally and understand its architecture, workflows, and safety caveats. Make sure to follow the security guidance.
