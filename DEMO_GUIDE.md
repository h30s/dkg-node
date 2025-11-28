# VeritasOS Demo Guide

## Overview

This guide demonstrates how VeritasOS uses **OriginTrail DKG**, **Model Context Protocol (MCP)**, and **NeuroWeb/Polkadot** to provide decentralized reputation scoring for AI agents.

## Technology Stack Integration

### 1. OriginTrail DKG Integration

VeritasOS publishes reputation profiles as **verifiable Knowledge Assets** on the OriginTrail Decentralized Knowledge Graph.

**How it works:**
- Reputation scores are computed using PageRank algorithm
- Profiles are converted to JSON-LD format
- Published to DKG with Universal Asset Locators (UALs)
- Verifiable on NeuroWeb (Polkadot parachain)

### 2. Model Context Protocol (MCP)

VeritasOS provides MCP tools that enable AI agents to query trust scores before taking actions.

**Available MCP Tools:**
- `trust_getReputation` - Query identity trust scores
- `trust_getContentTrust` - Evaluate content credibility

### 3. NeuroWeb/Polkadot

VeritasOS leverages OriginTrail's NeuroWeb parachain on Polkadot for:
- Decentralized storage of reputation data
- Blockchain-verified Knowledge Assets
- Immutable audit trail of reputation computations

**Configuration:**
```bash
# Environment variables for NeuroWeb testnet
DKG_BLOCKCHAIN=otp:20430  # NeuroWeb testnet
DKG_OTNODE_URL=https://v6-pegasus-node-02.origin-trail.network:8900
```

## Demo Scenarios

### Scenario 1: Publishing Reputation to DKG

**Step 1: Compute Reputation**
```bash
# Start the DKG agent
cd apps/agent
npm run dev
```

The reputation engine automatically:
1. Loads social graph data (15 subjects, 24 edges)
2. Computes PageRank scores
3. Calculates Sybil resistance metrics
4. Publishes to DKG as JSON-LD Knowledge Assets

**Step 2: View Published Asset**

The system generates JSON-LD Knowledge Assets like:

```json
{
  "@context": "https://veritasos.io/context/reputation",
  "@type": "ReputationProfile",
  "subject": "dkg:ual:guardian-001",
  "subjectType": "SocialIdentity",
  "overallScore": 0.96,
  "scores": {
    "global": 0.96,
    "networkTrust": 0.96,
    "misinfoResistance": 0.85
  },
  "computedBy": "dkg:ual:veritasos-reputation-engine-v1",
  "algorithm": "PageRank-v1",
  "timestamp": "2024-11-28T12:00:00Z"
}
```

**Step 3: Verify on DKG**

Each reputation profile receives a UAL (Universal Asset Locator):
```
did:dkg:otp/testnet/guardian-001/1732800000000
```

This UAL can be used to:
- Query the asset from any DKG node
- Verify authenticity on NeuroWeb blockchain
- Trace the provenance of reputation data

### Scenario 2: AI Agent Using MCP Tools

**Use Case:** An AI agent needs to decide whether to trust a user before executing a high-stakes action.

**Step 1: AI Agent Queries Reputation**

```typescript
// AI agent code
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

const mcpClient = new Client({
  name: "trust-aware-agent",
  version: "1.0.0"
});

// Connect to VeritasOS MCP server
await mcpClient.connect(transport);

// Query reputation before taking action
const result = await mcpClient.callTool({
  name: "trust_getReputation",
  arguments: {
    subjectId: "@factchecker_alice"
  }
});

console.log(result);
```

**Step 2: Response from MCP Tool**

```json
{
  "success": true,
  "subject": {
    "id": "guardian-001",
    "handle": "@factchecker_alice",
    "displayName": "Alice FactChecker",
    "type": "SocialIdentity"
  },
  "reputation": {
    "overallScore": 0.96,
    "trustLevel": "HIGH",
    "scores": {
      "global": 0.96,
      "networkTrust": 0.96,
      "misinfoResistance": 0.85
    },
    "explanation": "High reputation score. This identity has 2 incoming connections and 2 outgoing connections, indicating strong trust from the network.",
    "dkgAssetUAL": "did:dkg:otp/testnet/guardian-001/1732800000000"
  },
  "recommendation": "TRUST",
  "computedAt": "2024-11-28T12:00:00Z"
}
```

**Step 3: AI Agent Makes Decision**

```typescript
if (result.recommendation === "TRUST") {
  // Proceed with high-stakes action
  await executeFinancialTransaction();
  console.log("✅ Transaction executed - user is trusted");
} else if (result.recommendation === "VERIFY_BEFORE_TRUST") {
  // Request additional verification
  await requestHumanReview();
  console.log("⚠️ Additional verification required");
} else {
  // Do not trust, abort action
  console.log("❌ Action aborted - user not trusted");
}
```

### Scenario 3: Detecting Suspicious Accounts

**Query a low-reputation account:**

```bash
curl http://localhost:9200/veritasos/reputation/by-handle/bot_larry
```

**Response:**
```json
{
  "subject": {
    "id": "guardian-012",
    "handle": "@bot_larry",
    "displayName": "Larry Bot",
    "type": "SocialIdentity"
  },
  "reputation": {
    "overallScore": 0.12,
    "scores": {
      "global": 0.12,
      "networkTrust": 0.12,
      "misinfoResistance": 0.08
    },
    "explanation": "Low reputation score. This identity has 0 incoming connections and 1 outgoing connections, suggesting limited network trust or new account.",
    "ual": "did:dkg:otp/testnet/guardian-012/1732800000000"
  }
}
```

**AI Agent Decision:** `DO_NOT_TRUST` - Likely bot or Sybil account

### Scenario 4: Web UI Exploration

**Step 1: Open VeritasOS UI**
```bash
cd apps/veritasos-ui
npm run dev
# Visit http://localhost:3000
```

**Step 2: Search for Identity**
- Enter: `@factchecker_alice`
- View trust card with visual scores
- See DKG asset UAL for verification

**Step 3: Explore Leaderboard**
- View top 10 trusted identities
- Compare reputation scores
- Identify potential Sybil clusters

## DKG Integration Details

### Publishing Flow

1. **Compute Reputation** → PageRank algorithm processes social graph
2. **Generate JSON-LD** → Convert to DKG-compatible format
3. **Publish to DKG** → Submit to OriginTrail node
4. **Receive UAL** → Get Universal Asset Locator
5. **Store UAL** → Link reputation profile to DKG asset
6. **Verify on NeuroWeb** → Asset recorded on Polkadot parachain

### Querying Flow

1. **AI Agent Request** → MCP tool invocation
2. **Database Lookup** → Find reputation profile
3. **DKG Verification** → Optional: verify UAL on-chain
4. **Return Result** → Provide trust recommendation
5. **Agent Decision** → Execute or abort action

## NeuroWeb/Polkadot Integration

### Blockchain Configuration

VeritasOS uses NeuroWeb testnet (Polkadot parachain):

```typescript
// DKG Client configuration
const dkg = new DKG({
  endpoint: "https://v6-pegasus-node-02.origin-trail.network",
  port: "8900",
  blockchain: {
    name: "otp:20430",  // NeuroWeb testnet
    privateKey: process.env.DKG_PUBLISH_WALLET
  }
});
```

### Benefits of Polkadot Integration

1. **Decentralization**: No single point of failure
2. **Immutability**: Reputation data cannot be tampered with
3. **Interoperability**: Compatible with other Polkadot parachains
4. **Scalability**: Handles high-volume reputation queries
5. **Security**: Polkadot's shared security model

## Testing the Integration

### Test 1: Verify DKG Publishing

```bash
# Check if reputation profiles have UALs
curl http://localhost:9200/veritasos/top?limit=5 | jq '.[].reputation.ual'
```

Expected: List of DKG UALs

### Test 2: MCP Tool Invocation

```bash
# Test MCP tool via API
curl -X POST http://localhost:9200/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "trust_getReputation",
    "parameters": {
      "subjectId": "@factchecker_alice"
    }
  }'
```

Expected: Trust recommendation with DKG UAL

### Test 3: Swagger API Documentation

Visit: http://localhost:9200/swagger

Explore:
- `/veritasos/*` endpoints
- MCP tool documentation
- JSON-LD schema examples

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     AI Agent / dApp                         │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              MCP Tools (trust_getReputation)                │
│                  @dkg/plugin-veritasos-mcp                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│            Reputation Engine (PageRank)                     │
│              @dkg/plugin-veritasos-core                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              OriginTrail DKG Node                           │
│         (Publishes JSON-LD Knowledge Assets)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│          NeuroWeb (Polkadot Parachain)                      │
│        (Immutable, Verifiable Storage)                      │
└─────────────────────────────────────────────────────────────┘
```

## Key Takeaways

1. ✅ **DKG Integration**: Reputation profiles published as verifiable Knowledge Assets
2. ✅ **MCP Tools**: AI agents can query trust scores before taking actions
3. ✅ **NeuroWeb/Polkadot**: Blockchain-verified, immutable reputation data
4. ✅ **JSON-LD Format**: Standard, interoperable data representation
5. ✅ **Sybil Resistance**: PageRank algorithm detects fake accounts

## Next Steps

1. **Production Deployment**: Connect to NeuroWeb mainnet
2. **Real Data Integration**: Ingest actual Guardian social graph
3. **Advanced Features**: Implement x402 protocol for monetization
4. **Scale Testing**: Benchmark with larger datasets

---

**Built on OriginTrail DKG Node** | **Powered by NeuroWeb/Polkadot** | **AI-Ready with MCP**
