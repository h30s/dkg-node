# DKG Node + VeritasOS

A comprehensive monorepo for building Decentralized Knowledge Graph (DKG) applications with a modern tech stack including Expo, Drizzle ORM, SQLite, and MCP (Model Context Protocol) integration.

**🎯 This repository includes VeritasOS** - a decentralized reputation layer for trusted AI agents, built as a hackathon project on top of the OriginTrail DKG Node.

## 🏗️ Architecture Overview

This project consists of:

### Base DKG Node (OriginTrail)
- **Agent App**: A full-stack DKG agent with Expo UI and MCP server
- **Plugin System**: Modular plugins for extending functionality
- **Database Layer**: SQLite with Drizzle ORM for data persistence
- **Authentication**: OAuth-based authentication system
- **API Server**: Express-based API with Swagger documentation

### VeritasOS Addition (Hackathon Project)
- **plugin-veritasos-core**: Sybil-resistant reputation engine with PageRank algorithm
- **plugin-veritasos-mcp**: MCP tools for AI agents to query trust scores
- **veritasos-ui**: Next.js web interface for exploring reputation profiles
- **Features**: Decentralized trust scoring, DKG integration, AI agent decision support

## 🔍 VeritasOS - Decentralized Reputation Layer

**VeritasOS** is a hackathon project built on top of this DKG Node fork, providing a decentralized reputation oracle for AI agents and dApps.

### What VeritasOS Adds

1. **Reputation Engine** (`@dkg/plugin-veritasos-core`)
   - PageRank-inspired algorithm for computing trust scores
   - Sybil resistance through network analysis
   - Publishes reputation profiles as DKG Knowledge Assets

2. **AI Agent Integration** (`@dkg/plugin-veritasos-mcp`)
   - MCP tools: `trust_getReputation`, `trust_getContentTrust`
   - Actionable recommendations: TRUST / VERIFY_BEFORE_TRUST / DO_NOT_TRUST
   - Enables AI agents to make trust-based decisions

3. **Web UI** (`@dkg/veritasos-ui`)
   - Search identities by handle or ID
   - Visual trust cards with score breakdowns
   - Leaderboard of top trusted identities
   - DKG asset verification

### Quick Start with VeritasOS

```bash
# Install and build everything
npm install
npm run build

# Start the DKG agent with VeritasOS plugins
cd apps/agent
npm run dev

# In another terminal, start the VeritasOS UI
cd apps/veritasos-ui
npm run dev
```

Access:
- **DKG Agent + API**: http://localhost:9200
- **VeritasOS UI**: http://localhost:3000
- **API Docs**: http://localhost:9200/swagger

### VeritasOS API Endpoints

- `GET /veritasos/health` - Health check
- `GET /veritasos/stats` - Database statistics
- `GET /veritasos/reputation/:subjectId` - Get reputation by ID
- `GET /veritasos/reputation/by-handle/:handle` - Get reputation by handle
- `GET /veritasos/top?limit=20` - Get top trusted identities

### Technology Integration

**VeritasOS leverages:**
- **OriginTrail DKG**: Publishes reputation profiles as verifiable JSON-LD Knowledge Assets
- **Model Context Protocol (MCP)**: Provides AI agent tools for trust-based decisions
- **NeuroWeb/Polkadot**: Blockchain-verified, immutable reputation storage on Polkadot parachain
- **x402 Protocol**: Future integration for monetizing reputation queries (roadmap)

### Fork Attribution

This repository is forked from [OriginTrail/dkg-node](https://github.com/OriginTrail/dkg-node). VeritasOS is built as an extension on top of the base DKG Node infrastructure, demonstrating how to build reputation systems using the OriginTrail Decentralized Knowledge Graph.

### Documentation

- **Technical Specifications**: See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
- **Integration Guide**: See [VERITASOS_INTEGRATION.md](./VERITASOS_INTEGRATION.md)
- **API Reference**: Available at http://localhost:9200/swagger when running

---

## 📋 Requirements

- **Node.js** >= 22
- **npm** package manager
- **Turbo** CLI (install globally)

```bash
npm i -g turbo
```

## 🚀 Quick Start

### 1. Install & Build

```bash
npm install
npm run build
```

### 2. Environment Variables Setup

Before running the project setup, you'll need to configure the following environment variables. The setup script will prompt you for these values, but you can also prepare them in advance:

#### Required Variables

- **`DATABASE_URL`**: Database name for SQLite (e.g., `dkg.db`)
- **`OPENAI_API_KEY`**: Your OpenAI API key for LLM integration
- **`DKG_PUBLISH_WALLET`**: Private key for publishing to the DKG blockchain. This is used for:
  - Paying native token fees for blockchain transactions
  - Paying TRAC tokens for publishing to the DKG
  - Securing your node identity (keep your private keys secure!)

#### Optional Variables (with defaults)

- **`DKG_BLOCKCHAIN`**: Blockchain network identifier. Options:
  - Mainnet: `otp:2043`
  - Testnet: `otp:20430`
  - Default: `hardhat1:31337` (local development)
- **`DKG_OTNODE_URL`**: OT-node server URL. Options:
  - **Testnet** (safe testing with mock tokens): `https://v6-pegasus-node-02.origin-trail.network:8900`
  - **Mainnet** (production DKG interactions): `https://positron.origin-trail.network`
  - **Local development**: `http://localhost:8900` (default)
- **`PORT`**: Server port (default: `9200`)
- **`EXPO_PUBLIC_APP_URL`**: Public app URL (default: `http://localhost:9200`)
- **`EXPO_PUBLIC_MCP_URL`**: MCP server URL (default: `http://localhost:9200`)

### 3. Project Setup

```bash
cd apps/agent
npm run build:scripts
npm run script:setup
```

The setup script will:

- Prompt for required environment variables
- Create `.env` and `.env.development.local` files
- Set up the SQLite database with migrations
- Create an admin user (username: `admin`, password: `admin123`)

### 4. Start Development

```bash
npm run dev
```

That's it! Your DKG agent is now running with:

- **Frontend**: [http://localhost:8081](http://localhost:8081) (Expo app)
- **Backend**: [http://localhost:9200](http://localhost:9200) (MCP server + API)
- **Database**: SQLite with Drizzle Studio available

## 🗄️ Database Management

### Database Schema

The application uses SQLite with the following tables:

- **`users`**: User authentication and authorization
- **`oauth_clients`**: OAuth client management
- **`oauth_codes`**: OAuth authorization codes
- **`oauth_tokens`**: OAuth access tokens

### Database Commands

```bash
# Generate new migrations
npm run build:migrations

# View database in Drizzle Studio
npm run drizzle:studio

# Create new user/token
npm run script:createUser
npm run script:createToken
```

### Drizzle Studio

Access your database through the web interface:

```bash
npm run drizzle:studio
```

Then open [https://local.drizzle.studio](https://local.drizzle.studio)

## 🧩 Plugin Development

### Creating MCP/API Plugins

#### 1. Generate Plugin Package

```bash
turbo gen plugin
# Name: plugin-<your-name>
```

#### 2. Develop Your Plugin

Edit `packages/plugin-<your-name>/src/index.ts`:

```typescript
import { defineDkgPlugin } from "@dkg/plugins";

export default defineDkgPlugin((ctx, mcp, api) => {
  // Register MCP tools/resources
  mcp.tools.register("myTool", {
    // Tool implementation
  });

  // Register API routes
  api.get("/my-endpoint", (req, res) => {
    // Route implementation
  });
});
```

#### 3. Use in Agent

```bash
cd apps/agent
npm install --save @dkg/plugin-<your-name>
```

Then register in `src/index.ts`:

```typescript
import myPlugin from "@dkg/plugin-<your-name>";

// In createPluginServer function
plugins: [myPlugin];
```

### Plugin Context

Plugins receive three injected arguments:

- **`ctx`**: DKG environment context (logger, DKG client, etc.)
- **`mcp`**: MCP Server instance for registering tools/resources
- **`api`**: Express server for API routes

## 📱 Available Scripts

### Development

```bash
npm run dev              # Start both app and server
npm run dev:app          # Start Expo app only
npm run dev:server       # Start MCP server only
```

### Building

```bash
npm run build            # Build all packages
npm run build:server     # Build server code
npm run build:web        # Build web app
npm run build:scripts    # Build utility scripts
npm run build:migrations # Generate database migrations
```

### Testing

The project includes three testing layers for comprehensive coverage:

```bash
# API Tests - Individual plugin/endpoint testing
npm run test:api         # Run all plugin API tests

# Integration Tests - Cross-plugin interaction testing
npm run test:integration # Run integration tests

# End-to-end user interface testing
npm run test:e2e         # Run Playwright tests

# Run all tests
npm test                 # Run API, integration, and E2E tests
```

## 🚀 Production Deployment

### Build for Production

```bash
npm run build            # Build all packages
npm run build:web        # Build web app
npm run build:server     # Build server
```

### Run Production Server

```bash
cd apps/agent
node dist/index.js
```

## 📦 Package Management

### Adding Dependencies

```bash
# Add to specific package
cd packages/your-package
npm install --save package-name

# Add to app
cd apps/agent
npm install --save package-name
```

### Using Local Packages

```bash
# Install local package in another package
npm install --save @dkg/your-package-name
```

## 🔍 Troubleshooting

### Common Issues

#### Build Failures

```bash
# Clean and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Database Issues

```bash
# Regenerate migrations
npm run build:migrations

# Reset database
rm *.db
npm run script:setup
```

#### TypeScript Errors

```bash
# Check types
npm run check-types

# Reinstall dependencies
npm install
npm run build
```

### Getting Help

- Check the [Turborepo documentation](https://turborepo.com/docs)
- Review existing plugins in `packages/plugin-*`
- Check the agent app README in `apps/agent/README.md`

## 📚 Useful Links

- [Turborepo Documentation](https://turborepo.com/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [DKG.js Documentation](https://docs.origintrail.io/dkg.js/)

## 🤝 Contributing

1. Follow the existing code structure
2. Use `turbo gen` for new packages/apps
3. Run `turbo format check-types lint build` before committing
4. Follow the established patterns in existing plugins

## 📄 License

This project is part of the DKG ecosystem. See individual package licenses for details.
