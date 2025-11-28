import { Subject, Edge, ReputationProfile, GraphNode } from '../types';
import { SubjectRepository } from '../database/repositories/SubjectRepository';
import { EdgeRepository } from '../database/repositories/EdgeRepository';
import { ReputationRepository } from '../database/repositories/ReputationRepository';
import { DkgClient } from './DkgClient';

export class ReputationEngine {
  private dampingFactor = 0.85;
  private iterations = 20;
  private algorithmVersion = 'PageRank-v1';
  private dkgClient: DkgClient;

  constructor() {
    this.dkgClient = new DkgClient();
  }

  /**
   * Build a graph representation from database
   */
  private buildGraph(subjects: Subject[], edges: Edge[]): Map<string, GraphNode> {
    const graph = new Map<string, GraphNode>();

    // Initialize nodes
    for (const subject of subjects) {
      graph.set(subject.id, {
        id: subject.id,
        inDegree: 0,
        outDegree: 0,
        neighbors: [],
        score: 1.0 / subjects.length, // Initial uniform distribution
      });
    }

    // Add edges
    for (const edge of edges) {
      const sourceNode = graph.get(edge.sourceId);
      const targetNode = graph.get(edge.targetId);

      if (sourceNode && targetNode) {
        sourceNode.neighbors.push(edge.targetId);
        sourceNode.outDegree++;
        targetNode.inDegree++;
      }
    }

    return graph;
  }

  /**
   * Compute PageRank scores
   */
  private computePageRank(graph: Map<string, GraphNode>): void {
    const n = graph.size;
    const nodes = Array.from(graph.values());

    for (let iter = 0; iter < this.iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const node of nodes) {
        let score = (1 - this.dampingFactor) / n;

        // Sum contributions from incoming edges
        for (const otherNode of nodes) {
          if (otherNode.neighbors.includes(node.id) && otherNode.outDegree > 0) {
            score += this.dampingFactor * ((otherNode.score || 0) / otherNode.outDegree);
          }
        }

        newScores.set(node.id, score);
      }

      // Update scores
      for (const node of nodes) {
        node.score = newScores.get(node.id) || 0;
      }
    }

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...nodes.map(n => n.score || 0));
    if (maxScore > 0) {
      for (const node of nodes) {
        node.score = (node.score || 0) / maxScore;
      }
    }
  }

  /**
   * Calculate misinformation resistance score
   * Higher score = less likely to spread/believe misinformation
   * Based on: network centrality, bi-directional connections, account maturity
   */
  private calculateMisinfoResistance(subjectId: string, graph: Map<string, GraphNode>, subjects: Subject[]): number {
    const node = graph.get(subjectId);
    if (!node) return 0.5;
    
    const subject = subjects.find(s => s.id === subjectId);
    if (!subject) return 0.5;
    
    // Factor 1: Network position (higher PageRank = more trusted)
    const networkFactor = node.score || 0;
    
    // Factor 2: Bidirectional connections ratio (mutual connections indicate trust)
    const bidirectionalRatio = node.inDegree > 0 ? 
      Math.min(node.outDegree / node.inDegree, 1.0) : 0;
    
    // Factor 3: Account age (older accounts are more established)
    const createdDate = new Date(subject.createdAt);
    const now = new Date();
    const ageInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    const ageFactor = Math.min(ageInDays / 365, 1.0); // Normalize to 0-1 over 1 year
    
    // Weighted combination
    const misinfoScore = (networkFactor * 0.5) + (bidirectionalRatio * 0.3) + (ageFactor * 0.2);
    
    return Math.min(Math.max(misinfoScore, 0), 1);
  }

  /**
   * Generate explanation for a reputation score
   */
  private generateExplanation(subjectId: string, score: number, graph: Map<string, GraphNode>): string {
    const node = graph.get(subjectId);
    if (!node) return 'No data available';

    const inDegree = node.inDegree;
    const outDegree = node.outDegree;
    
    let explanation = '';
    
    if (score >= 0.7) {
      explanation = `High reputation score. This identity has ${inDegree} incoming connections and ${outDegree} outgoing connections, indicating strong trust from the network.`;
    } else if (score >= 0.4) {
      explanation = `Moderate reputation score. This identity has ${inDegree} incoming connections and ${outDegree} outgoing connections, showing average network engagement.`;
    } else {
      explanation = `Low reputation score. This identity has ${inDegree} incoming connections and ${outDegree} outgoing connections, suggesting limited network trust or new account.`;
    }

    return explanation;
  }

  /**
   * Compute reputation scores for all subjects
   */
  async computeAllReputations(): Promise<void> {
    console.log('[VeritasOS] Starting reputation computation...');

    const subjects = SubjectRepository.findAll();
    const edges = EdgeRepository.findAll();

    console.log(`[VeritasOS] Processing ${subjects.length} subjects and ${edges.length} edges`);

    if (subjects.length === 0) {
      console.log('[VeritasOS] No subjects to process');
      return;
    }

    // Build graph
    const graph = this.buildGraph(subjects, edges);

    // Compute PageRank
    this.computePageRank(graph);

    // Save reputation profiles
    const timestamp = new Date().toISOString();
    let savedCount = 0;

    for (const [subjectId, node] of graph) {
      const overallScore = node.score || 0;
      const misinfoResistance = this.calculateMisinfoResistance(subjectId, graph, subjects);
      const explanation = this.generateExplanation(subjectId, overallScore, graph);

      const profile: ReputationProfile = {
        subjectId,
        overallScore,
        scores: {
          global: overallScore,
          networkTrust: overallScore, // Same as global for now
          misinfoResistance,
        },
        algorithmVersion: this.algorithmVersion,
        computedAt: timestamp,
        explanation,
      };

      ReputationRepository.upsert(profile);
      savedCount++;
    }

    console.log(`[VeritasOS] Computed and saved ${savedCount} reputation profiles`);
    
    // Publish to DKG and update UALs
    console.log('[VeritasOS] Publishing reputation profiles to DKG...');
    const profiles = Array.from(graph.keys()).map(subjectId => 
      ReputationRepository.findBySubjectId(subjectId)!
    );
    
    try {
      const ualMap = await this.dkgClient.batchPublishReputations(profiles);
      
      // Update profiles with UALs
      let ualCount = 0;
      for (const [subjectId, ual] of ualMap) {
        const profile = ReputationRepository.findBySubjectId(subjectId);
        if (profile) {
          profile.ual = ual;
          ReputationRepository.upsert(profile);
          ualCount++;
        }
      }
      
      console.log(`[VeritasOS] Published ${ualCount} reputation profiles to DKG`);
    } catch (error) {
      console.error('[VeritasOS] Error publishing to DKG:', error);
    }
    
    console.log('[VeritasOS] Reputation computation completed!');
  }

  /**
   * Get statistics about computed reputations
   */
  getStatistics(): { count: number; topScores: number[]; avgScore: number } {
    const profiles = ReputationRepository.findTopN(100);
    const scores = profiles.map(p => p.overallScore);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      count: profiles.length,
      topScores: scores.slice(0, 10),
      avgScore,
    };
  }
}
