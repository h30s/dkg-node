# VeritasOS Integration Documentation

## Overview

This document describes the integration of **VeritasOS** - a decentralized reputation layer for trusted AI agents - into the OriginTrail DKG Node fork.

**Repository**: https://github.com/h30s/dkg-node (forked from https://github.com/OriginTrail/dkg-node)

## What is VeritasOS?

VeritasOS is a hackathon project that provides a Sybil-resistant reputation oracle system for AI agents and dApps. It computes trust scores from social graphs using a PageRank-inspired algorithm and publishes them as verifiable Knowledge Assets on the OriginTrail Decentralized Knowledge Graph.

### Key Features

1. **Reputation Engine**: PageRank-based algorithm for computing trust scores
2. **Sybil Resistance**: Bot detection through network analysis
3. **DKG Integration**: Publishes reputation profiles as Knowledge Assets
4. **MCP Tools**: AI agent integration for trust-based decisions
5. **Web UI**: Reputation explorer with search and leaderboard

## Architecture

### Plugin-Based Integration

VeritasOS is integrated as a set of plugins within the DKG Node's modular architecture:

```
dkg-node/ (FORK - OriginTrail/dkg-node)
├── apps/
│   ├── agent/                    # Base DKG agent (OriginTrail)
│   └── veritasos-ui/            # VeritasOS frontend (NEW)
├── packages/
│   ├── plugin-veritasos-core/   # Reputation engine (NEW)
│   ├── plugin-veritasos-mcp/    # MCP tools for AI (NEW)
│   └── [existing plugins...]    # Base DKG plugins
```

### Components

#### 1. plugin-veritasos-core (`@dkg/plugin-veritasos-core`)

**Purpose**: Core reputation engine and REST API

**Features**:
- In-memory graph database for subjects and edges
- PageRank-inspired reputation scoring algorithm
- Misinformation resistance calculation
- DKG Knowledge Asset publishing
- REST API endpoints for querying reputation

**API Endpoints**:
- `GET /veritasos/health` - Health check
- `GET /veritasos/stats` - Database statistics
- `GET /veritasos/reputation/:subjectId` - Get reputation by ID
- `GET /veritasos/reputation/by-handle/:handle` - Get reputation by handle
- `GET /veritasos/top?limit=20` - Get top trusted identities

**Key Files**:
- `src/services/ReputationEngine.ts` - PageRank algorithm implementation
- `src/services/DkgClient.ts` - DKG integration layer
- `src/database/` - In-memory database and repositories
- `src/index.ts` - Plugin entry point

#### 2. plugin-veritasos-mcp (`@dkg/plugin-veritasos-mcp`)

**Purpose**: Model Context Protocol tools for AI agents

**Features**:
- MCP tool: `trust_getReputation` - Query trust scores
- MCP tool: `trust_getContentTrust` - Content credibility (future)
- Actionable recommendations: TRUST / VERIFY_BEFORE_TRUST / DO_NOT_TRUST
- Knowledge Asset source attribution

**Usage Example**:
```typescript
const result = await mcpServer.invokeTool('trust_getReputation', {
  subjectId: '@factchecker_alice',
});

if (result.recommendation === 'TRUST') {
  // Proceed with high-stakes action
} else {
  // Request additional verification
}
```

#### 3. veritasos-ui (`@dkg/veritasos-ui`)

**Purpose**: Next.js web interface for exploring reputation

**Features**:
- Search identities by handle or ID
- Visual trust cards with score breakdowns
- Leaderboard of top trusted identities
- DKG asset verification links
- Real-time statistics

**Tech Stack**:
- Next.js 16
- React 19
- TypeScript
- TailwindCSS 4

**Access**: http://localhost:3000 (when running)

## Installation & Setup

### Prerequisites

- Node.js >= 22
- npm package manager
- Turbo CLI (optional but recommended)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/h30s/dkg-node.git
cd dkg-node

# Install dependencies
npm install

# Build all packages
npm run build

# Start the DKG agent with VeritasOS plugins
cd apps/agent
npm run dev

# In another terminal, start the VeritasOS UI
cd apps/veritasos-ui
npm run dev
```

### Access Points

- **DKG Agent + API**: http://localhost:9200
- **VeritasOS UI**: http://localhost:3000
- **API Documentation**: http://localhost:9200/swagger

## Development

### Adding New Features

1. **Reputation Algorithm Changes**: Edit `packages/plugin-veritasos-core/src/services/ReputationEngine.ts`
2. **New API Endpoints**: Add routes in `packages/plugin-veritasos-core/src/index.ts`
3. **New MCP Tools**: Add tools in `packages/plugin-veritasos-mcp/src/index.ts`
4. **UI Changes**: Edit files in `apps/veritasos-ui/app/`

### Testing

```bash
# Run all tests
npm test

# Run specific plugin tests
npm run test:api

# Run integration tests
npm run test:integration
```

### Building

```bash
# Build all packages
npm run build

# Build specific package
cd packages/plugin-veritasos-core
npm run build
```

## Hackathon Compliance

### Fork Relationship

✅ **Verified**: This repository is forked from [OriginTrail/dkg-node](https://github.com/OriginTrail/dkg-node)

GitHub shows the fork badge: "forked from OriginTrail/dkg-node"

### Code Attribution

- **Base Code**: All code in `apps/agent/`, `packages/plugin-auth/`, `packages/plugin-dkg-essentials/`, etc. is from the original OriginTrail DKG Node
- **VeritasOS Addition**: Code in `packages/plugin-veritasos-*` and `apps/veritasos-ui/` is the hackathon contribution

### Clear Differentiation

1. **Folder Structure**: VeritasOS code is in clearly named directories
2. **README**: Updated to show fork relationship and additions
3. **Documentation**: This file explains the integration
4. **Git History**: Commits show the integration process

## Technical Details

### Reputation Algorithm

The reputation engine uses a PageRank-inspired algorithm:

1. **Graph Construction**: Build directed graph from subjects and edges
2. **PageRank Iteration**: Compute scores over 20 iterations with damping factor 0.85
3. **Normalization**: Scale scores to 0-1 range
4. **Misinformation Resistance**: Calculate based on network position, bidirectional connections, and account age
5. **DKG Publishing**: Convert profiles to JSON-LD and publish as Knowledge Assets

### Data Model

```typescript
interface Subject {
  id: string;
  type: 'SocialIdentity' | 'Address' | 'Content';
  handle?: string;
  displayName?: string;
  createdAt: string;
}

interface ReputationProfile {
  subjectId: string;
  overallScore: number;
  scores: {
    global: number;
    misinfoResistance?: number;
    networkTrust?: number;
  };
  algorithmVersion: string;
  computedAt: string;
  ual?: string;  // DKG Universal Asset Locator
  explanation?: string;
}
```

### DKG Integration

Reputation profiles are published to the DKG as JSON-LD Knowledge Assets:

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

## Future Enhancements

1. **Real Data Integration**: Connect to actual Guardian social graph
2. **Content Trust**: Implement content credibility assessment
3. **Persistent Storage**: Replace in-memory DB with PostgreSQL
4. **Real DKG Publishing**: Use actual dkg.js SDK instead of mock
5. **Advanced Algorithms**: Add more sophisticated Sybil detection
6. **API Authentication**: Add OAuth protection to VeritasOS endpoints

## Credits

- **Base DKG Node**: [OriginTrail](https://github.com/OriginTrail/dkg-node)
- **VeritasOS**: Built for OriginTrail × Polkadot × Umanitek Hackathon
- **Technologies**: OriginTrail DKG, Polkadot, Guardian Social Graph

## License

This project inherits the license from the original OriginTrail DKG Node. VeritasOS additions are provided under MIT License.

---

**Built with ❤️ for the OriginTrail Ecosystem**
