# @dkg/plugin-veritasos-mcp

**MCP Tools for AI Agent Trust Decisions**

This plugin provides Model Context Protocol (MCP) tools that enable AI agents to query reputation scores and make trust-based decisions before taking actions.

## Features

- **trust_getReputation**: Query trust scores for identities
- **trust_getContentTrust**: Evaluate content credibility (future)
- **Actionable Recommendations**: TRUST / VERIFY_BEFORE_TRUST / DO_NOT_TRUST

## Installation

```bash
npm install @dkg/plugin-veritasos-mcp
```

## Usage

```typescript
import veritasosMcp from "@dkg/plugin-veritasos-mcp";

// Register in your DKG agent
plugins: [veritasosMcp]
```

## MCP Tools

### trust_getReputation

Get reputation score for a subject (identity, account, or address).

**Parameters:**
- `subjectId` (string): The ID or handle of the subject to query
- `context` (string, optional): Optional context for the query

**Returns:**
- `success` (boolean): Whether the query succeeded
- `subject`: Subject information
- `reputation`: Reputation scores and explanation
- `recommendation`: TRUST / VERIFY_BEFORE_TRUST / DO_NOT_TRUST
- `computedAt`: Timestamp of computation

**Example:**
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

## Architecture

This plugin is part of the VeritasOS hackathon project built on top of the OriginTrail DKG Node.

**Original DKG Node**: https://github.com/OriginTrail/dkg-node
**VeritasOS Addition**: AI agent trust decision layer
