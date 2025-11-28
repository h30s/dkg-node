# VeritasOS Technical Documentation

## Overview

VeritasOS is a decentralized reputation oracle built on the OriginTrail DKG Node, providing Sybil-resistant trust scores for AI agents and decentralized applications.

## Technology Stack

### Core Technologies

- **OriginTrail DKG**: Decentralized Knowledge Graph for verifiable data storage
- **NeuroWeb (Polkadot)**: Blockchain infrastructure for immutable reputation records
- **Model Context Protocol (MCP)**: AI agent integration layer
- **JSON-LD**: Structured data format for Knowledge Assets

### Architecture Components

```
AI Agent → MCP Tools → Reputation Engine → DKG Node → NeuroWeb Blockchain
```

## DKG Integration

### Knowledge Asset Publishing

VeritasOS publishes reputation profiles as JSON-LD Knowledge Assets to the OriginTrail DKG:

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

### Universal Asset Locators (UALs)

Each reputation profile receives a unique UAL for verification:

```
did:dkg:otp/testnet/guardian-001/1732800000000
```

UALs enable:
- Cross-platform reputation queries
- Blockchain verification on NeuroWeb
- Immutable audit trails

## Model Context Protocol (MCP) Integration

### AI Agent Tools

VeritasOS provides MCP tools for AI agents to make trust-based decisions:

#### trust_getReputation

Query reputation scores before executing actions:

```typescript
const result = await mcpClient.callTool({
  name: "trust_getReputation",
  arguments: { subjectId: "@factchecker_alice" }
});

// Response includes actionable recommendation
if (result.recommendation === "TRUST") {
  await executeAction();
}
```

**Response Structure:**

```json
{
  "success": true,
  "subject": {
    "id": "guardian-001",
    "handle": "@factchecker_alice",
    "displayName": "Alice FactChecker"
  },
  "reputation": {
    "overallScore": 0.96,
    "trustLevel": "HIGH",
    "dkgAssetUAL": "did:dkg:otp/testnet/guardian-001/..."
  },
  "recommendation": "TRUST"
}
```

**Recommendations:**
- `TRUST` - High confidence, proceed with action
- `VERIFY_BEFORE_TRUST` - Moderate confidence, request additional verification
- `DO_NOT_TRUST` - Low confidence, abort action

## NeuroWeb/Polkadot Integration

### Blockchain Configuration

VeritasOS connects to NeuroWeb testnet (Polkadot parachain):

```typescript
const dkg = new DKG({
  endpoint: "https://v6-pegasus-node-02.origin-trail.network",
  port: "8900",
  blockchain: {
    name: "otp:20430",  // NeuroWeb testnet
    privateKey: process.env.DKG_PUBLISH_WALLET
  }
});
```

### Benefits

1. **Decentralization**: No single point of failure
2. **Immutability**: Tamper-proof reputation records
3. **Interoperability**: Compatible with Polkadot ecosystem
4. **Scalability**: High-throughput reputation queries
5. **Security**: Polkadot's shared security model

## Reputation Algorithm

### PageRank-Inspired Scoring

VeritasOS uses a modified PageRank algorithm to compute trust scores:

1. **Graph Construction**: Build directed graph from social connections
2. **Iterative Computation**: 20 iterations with damping factor 0.85
3. **Normalization**: Scale scores to 0-1 range
4. **Sybil Detection**: Identify isolated nodes and bot clusters

### Score Components

- **Global Score**: Overall network reputation
- **Network Trust**: Connection quality and reciprocity
- **Misinformation Resistance**: Account age and bidirectional connections

## API Endpoints

### REST API

```bash
# Health check
GET /veritasos/health

# Get statistics
GET /veritasos/stats

# Query by ID
GET /veritasos/reputation/:subjectId

# Query by handle
GET /veritasos/reputation/by-handle/:handle

# Top trusted identities
GET /veritasos/top?limit=20
```

### Example Request

```bash
curl http://localhost:9200/veritasos/reputation/by-handle/factchecker_alice
```

### Example Response

```json
{
  "subject": {
    "id": "guardian-001",
    "handle": "@factchecker_alice",
    "displayName": "Alice FactChecker",
    "type": "SocialIdentity"
  },
  "reputation": {
    "overallScore": 0.96,
    "scores": {
      "global": 0.96,
      "networkTrust": 0.96,
      "misinfoResistance": 0.85
    },
    "algorithmVersion": "PageRank-v1",
    "computedAt": "2024-11-28T12:00:00Z",
    "ual": "did:dkg:otp/testnet/guardian-001/1732800000000",
    "explanation": "High reputation score. Strong trust from network."
  }
}
```

## Use Cases

### AI Agent Decision Support

AI agents query reputation before executing high-stakes actions:

```typescript
// Before financial transaction
const reputation = await getReputation(userId);
if (reputation.recommendation === "TRUST") {
  await processPayment();
} else {
  await requestHumanReview();
}
```

### dApp Integration

Decentralized applications filter content and gate features:

```typescript
// Filter bot accounts
const users = await getTopReputations(100);
const trustedUsers = users.filter(u => u.overallScore > 0.7);
```

### Sybil Detection

Identify suspicious accounts through network analysis:

```typescript
// Detect potential bots
const lowReputation = await getReputationByHandle("@suspicious_account");
if (lowReputation.scores.misinfoResistance < 0.2) {
  flagAsPotentialBot();
}
```

## Data Flow

### Publishing Flow

1. Compute reputation scores using PageRank
2. Convert profiles to JSON-LD format
3. Publish to OriginTrail DKG node
4. Receive Universal Asset Locator (UAL)
5. Store UAL for future verification
6. Record transaction on NeuroWeb blockchain

### Query Flow

1. AI agent invokes MCP tool
2. Lookup reputation in local database
3. Return profile with DKG UAL
4. Agent verifies UAL on-chain (optional)
5. Agent makes trust-based decision

## Environment Configuration

### Required Variables

```bash
# DKG Configuration
DKG_BLOCKCHAIN=otp:20430  # NeuroWeb testnet
DKG_OTNODE_URL=https://v6-pegasus-node-02.origin-trail.network:8900
DKG_PUBLISH_WALLET=<your-private-key>

# Server Configuration
PORT=9200
EXPO_PUBLIC_APP_URL=http://localhost:9200
EXPO_PUBLIC_MCP_URL=http://localhost:9200
```

### Network Options

- **Testnet**: `otp:20430` (NeuroWeb testnet - recommended for development)
- **Mainnet**: `otp:2043` (NeuroWeb mainnet - production)
- **Local**: `hardhat1:31337` (local development)

## Testing

### API Testing

```bash
# Test health endpoint
curl http://localhost:9200/veritasos/health

# Test reputation query
curl http://localhost:9200/veritasos/reputation/by-handle/factchecker_alice

# Test top identities
curl http://localhost:9200/veritasos/top?limit=5
```

### MCP Tool Testing

```bash
# Test MCP tool invocation
curl -X POST http://localhost:9200/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "toolName": "trust_getReputation",
    "parameters": { "subjectId": "@factchecker_alice" }
  }'
```

## Future Enhancements

### x402 Protocol Integration

Planned integration for monetizing reputation queries:

- Pay-per-query model for premium reputation data
- Micropayments using x402 protocol
- Revenue sharing with data contributors

### Production Roadmap

1. Connect to NeuroWeb mainnet
2. Integrate real Guardian social graph data
3. Implement x402 monetization
4. Scale to millions of reputation profiles
5. Add advanced Sybil detection algorithms

## Security Considerations

### Data Privacy

- Reputation scores are computed from public social graph data
- No personally identifiable information (PII) stored
- DKG assets can be published as private or public

### Sybil Resistance

- PageRank algorithm naturally resists Sybil attacks
- Isolated nodes receive low trust scores
- Bidirectional connections weighted higher

### Blockchain Verification

- All reputation profiles verifiable on NeuroWeb
- Immutable audit trail prevents tampering
- Cryptographic signatures ensure authenticity

## Performance

### Scalability

- In-memory database for fast queries (< 10ms)
- Batch publishing to DKG for efficiency
- Horizontal scaling via plugin architecture

### Optimization

- Cached reputation scores
- Incremental PageRank updates
- Lazy DKG publishing for changed profiles

## Support

For technical questions or issues:

- **Documentation**: See [VERITASOS_INTEGRATION.md](./VERITASOS_INTEGRATION.md)
- **Repository**: https://github.com/h30s/dkg-node
- **Base Project**: https://github.com/OriginTrail/dkg-node

---

**Built on OriginTrail DKG Node** | **Powered by NeuroWeb/Polkadot** | **AI-Ready with MCP**
