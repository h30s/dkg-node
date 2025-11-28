# @dkg/plugin-veritasos-core

**Decentralized Reputation Layer for Trusted AI Agents**

VeritasOS Core provides a Sybil-resistant reputation engine that computes trust scores from social graphs and publishes them as verifiable Knowledge Assets on the OriginTrail DKG.

## Features

- **PageRank-inspired Reputation Algorithm**: Computes trust scores based on network topology
- **Sybil Resistance**: Detects bots and fake accounts through graph analysis
- **DKG Integration**: Publishes reputation profiles as verifiable Knowledge Assets
- **REST API**: Query reputation scores via HTTP endpoints
- **MCP Tools**: AI agent integration for trust-based decision making

## Installation

```bash
npm install @dkg/plugin-veritasos-core
```

## Usage

```typescript
import veritasosCore from "@dkg/plugin-veritasos-core";

// Register in your DKG agent
plugins: [veritasosCore]
```

## API Endpoints

- `GET /veritasos/health` - Health check
- `GET /veritasos/stats` - Database statistics
- `GET /veritasos/reputation/:subjectId` - Get reputation by ID
- `GET /veritasos/reputation/by-handle/:handle` - Get reputation by handle
- `GET /veritasos/top?limit=20` - Get top trusted identities

## Architecture

This plugin is part of the VeritasOS hackathon project built on top of the OriginTrail DKG Node.

**Original DKG Node**: https://github.com/OriginTrail/dkg-node
**VeritasOS Addition**: Reputation oracle system for AI trust decisions
