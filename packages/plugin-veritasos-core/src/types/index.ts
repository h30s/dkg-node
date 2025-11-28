export interface Subject {
  id: string;
  type: 'SocialIdentity' | 'Address' | 'Content';
  handle?: string;
  displayName?: string;
  createdAt: string;
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'follow' | 'endorse' | 'reply' | 'cite';
  weight: number;
  createdAt: string;
}

export interface ReputationProfile {
  subjectId: string;
  overallScore: number;
  scores: {
    global: number;
    misinfoResistance?: number;
    networkTrust?: number;
  };
  algorithmVersion: string;
  computedAt: string;
  ual?: string;
  explanation?: string;
}

export interface ReputationAsset {
  '@context': string;
  '@type': string;
  subject: string;
  subjectType: string;
  overallScore: number;
  scores: {
    global: number;
    misinfoResistance?: number;
    networkTrust?: number;
  };
  evidenceGraph?: string[];
  computedBy: string;
  algorithm: string;
  timestamp: string;
}

export interface ContentItem {
  id: string;
  url?: string;
  contentHash?: string;
  authorId: string;
  createdAt: string;
  trustScore?: number;
}

export interface GraphNode {
  id: string;
  inDegree: number;
  outDegree: number;
  neighbors: string[];
  score?: number;
}
