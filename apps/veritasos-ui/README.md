# VeritasOS Reputation Explorer

**Web UI for Querying Decentralized Trust Scores**

This is the frontend application for VeritasOS, providing a user-friendly interface to explore reputation scores, search identities, and view trust rankings.

## Features

- 🔍 **Search Identities**: Query reputation by handle or ID
- 📊 **Trust Cards**: Visual representation of trust scores
- 🏆 **Leaderboard**: Top trusted identities ranking
- 🔗 **DKG Integration**: View verifiable Knowledge Asset references

## Quick Start

```bash
# Install dependencies (from monorepo root)
npm install

# Start development server
npm run dev --workspace=@dkg/veritasos-ui

# Or from this directory
npm run dev
```

The UI will be available at http://localhost:3000

## Configuration

Set the API endpoint in `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:9200
```

## Architecture

This app is part of the VeritasOS hackathon project built on top of the OriginTrail DKG Node.

**Original DKG Node**: https://github.com/OriginTrail/dkg-node
**VeritasOS Addition**: Reputation explorer UI

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- TailwindCSS 4
