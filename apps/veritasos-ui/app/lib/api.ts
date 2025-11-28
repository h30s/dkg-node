const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9200';

export interface Subject {
  id: string;
  handle?: string;
  displayName?: string;
  type: string;
}

export interface ReputationScores {
  global: number;
  misinfoResistance?: number;
  networkTrust?: number;
}

export interface Reputation {
  overallScore: number;
  scores: ReputationScores;
  algorithmVersion: string;
  computedAt: string;
  ual?: string;
  explanation?: string;
}

export interface ReputationResponse {
  subject: Subject;
  reputation: Reputation;
}

export interface Stats {
  subjects: number;
  edges: number;
  reputationProfiles: number;
}

export class ApiClient {
  static async getHealth() {
    const response = await fetch(`${API_BASE_URL}/veritasos/health`);
    if (!response.ok) throw new Error('API health check failed');
    return response.json();
  }

  static async getStats(): Promise<Stats> {
    const response = await fetch(`${API_BASE_URL}/veritasos/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  }

  static async getReputationById(subjectId: string): Promise<ReputationResponse> {
    const response = await fetch(`${API_BASE_URL}/veritasos/reputation/${subjectId}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Subject not found');
      }
      throw new Error('Failed to fetch reputation');
    }
    return response.json();
  }

  static async getReputationByHandle(handle: string): Promise<ReputationResponse> {
    // Remove @ prefix if present for URL encoding
    const cleanHandle = handle.startsWith('@') ? handle.substring(1) : handle;
    const response = await fetch(`${API_BASE_URL}/veritasos/reputation/by-handle/${encodeURIComponent(cleanHandle)}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Handle not found');
      }
      throw new Error('Failed to fetch reputation');
    }
    return response.json();
  }

  static async getTopReputations(limit: number = 20): Promise<ReputationResponse[]> {
    const response = await fetch(`${API_BASE_URL}/veritasos/top?limit=${limit}`);
    if (!response.ok) throw new Error('Failed to fetch top reputations');
    return response.json();
  }
}
