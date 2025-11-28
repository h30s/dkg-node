import { Subject, Edge } from '../types';
import { SubjectRepository } from '../database/repositories/SubjectRepository';
import { EdgeRepository } from '../database/repositories/EdgeRepository';

export class MockDataService {
  /**
   * Generate mock Guardian social graph data
   */
  static generateMockData(): void {
    console.log('[VeritasOS] Generating mock Guardian social graph data...');

    const subjects: Subject[] = [
      // High reputation nodes (trusted journalists, fact-checkers)
      { id: 'guardian-001', type: 'SocialIdentity', handle: '@factchecker_alice', displayName: 'Alice FactChecker', createdAt: '2024-01-01T00:00:00Z' },
      { id: 'guardian-002', type: 'SocialIdentity', handle: '@journalist_bob', displayName: 'Bob Journalist', createdAt: '2024-01-02T00:00:00Z' },
      { id: 'guardian-003', type: 'SocialIdentity', handle: '@expert_carol', displayName: 'Dr. Carol Expert', createdAt: '2024-01-03T00:00:00Z' },
      { id: 'guardian-004', type: 'SocialIdentity', handle: '@verifier_dave', displayName: 'Dave Verifier', createdAt: '2024-01-04T00:00:00Z' },
      { id: 'guardian-005', type: 'SocialIdentity', handle: '@analyst_eve', displayName: 'Eve Analyst', createdAt: '2024-01-05T00:00:00Z' },
      
      // Medium reputation nodes (regular users)
      { id: 'guardian-006', type: 'SocialIdentity', handle: '@user_frank', displayName: 'Frank User', createdAt: '2024-02-01T00:00:00Z' },
      { id: 'guardian-007', type: 'SocialIdentity', handle: '@user_grace', displayName: 'Grace User', createdAt: '2024-02-02T00:00:00Z' },
      { id: 'guardian-008', type: 'SocialIdentity', handle: '@user_henry', displayName: 'Henry User', createdAt: '2024-02-03T00:00:00Z' },
      { id: 'guardian-009', type: 'SocialIdentity', handle: '@user_iris', displayName: 'Iris User', createdAt: '2024-02-04T00:00:00Z' },
      { id: 'guardian-010', type: 'SocialIdentity', handle: '@user_jack', displayName: 'Jack User', createdAt: '2024-02-05T00:00:00Z' },
      
      // Low reputation nodes (new accounts, potential bots)
      { id: 'guardian-011', type: 'SocialIdentity', handle: '@newbie_karen', displayName: 'Karen Newbie', createdAt: '2024-11-01T00:00:00Z' },
      { id: 'guardian-012', type: 'SocialIdentity', handle: '@bot_larry', displayName: 'Larry Bot', createdAt: '2024-11-10T00:00:00Z' },
      { id: 'guardian-013', type: 'SocialIdentity', handle: '@spam_mike', displayName: 'Mike Spam', createdAt: '2024-11-15T00:00:00Z' },
      { id: 'guardian-014', type: 'SocialIdentity', handle: '@anon_nancy', displayName: 'Nancy Anon', createdAt: '2024-11-18T00:00:00Z' },
      { id: 'guardian-015', type: 'SocialIdentity', handle: '@temp_oscar', displayName: 'Oscar Temp', createdAt: '2024-11-20T00:00:00Z' },
    ];

    const edges: Edge[] = [
      // Trusted users endorse each other (creates high reputation cluster)
      { id: 'edge-001', sourceId: 'guardian-001', targetId: 'guardian-002', type: 'endorse', weight: 1.0, createdAt: '2024-01-10T00:00:00Z' },
      { id: 'edge-002', sourceId: 'guardian-001', targetId: 'guardian-003', type: 'endorse', weight: 1.0, createdAt: '2024-01-11T00:00:00Z' },
      { id: 'edge-003', sourceId: 'guardian-002', targetId: 'guardian-001', type: 'endorse', weight: 1.0, createdAt: '2024-01-12T00:00:00Z' },
      { id: 'edge-004', sourceId: 'guardian-002', targetId: 'guardian-004', type: 'endorse', weight: 1.0, createdAt: '2024-01-13T00:00:00Z' },
      { id: 'edge-005', sourceId: 'guardian-003', targetId: 'guardian-001', type: 'endorse', weight: 1.0, createdAt: '2024-01-14T00:00:00Z' },
      { id: 'edge-006', sourceId: 'guardian-003', targetId: 'guardian-005', type: 'endorse', weight: 1.0, createdAt: '2024-01-15T00:00:00Z' },
      { id: 'edge-007', sourceId: 'guardian-004', targetId: 'guardian-002', type: 'endorse', weight: 1.0, createdAt: '2024-01-16T00:00:00Z' },
      { id: 'edge-008', sourceId: 'guardian-005', targetId: 'guardian-003', type: 'endorse', weight: 1.0, createdAt: '2024-01-17T00:00:00Z' },
      
      // Regular users follow trusted accounts
      { id: 'edge-009', sourceId: 'guardian-006', targetId: 'guardian-001', type: 'follow', weight: 0.8, createdAt: '2024-02-10T00:00:00Z' },
      { id: 'edge-010', sourceId: 'guardian-006', targetId: 'guardian-002', type: 'follow', weight: 0.8, createdAt: '2024-02-11T00:00:00Z' },
      { id: 'edge-011', sourceId: 'guardian-007', targetId: 'guardian-001', type: 'follow', weight: 0.8, createdAt: '2024-02-12T00:00:00Z' },
      { id: 'edge-012', sourceId: 'guardian-007', targetId: 'guardian-003', type: 'follow', weight: 0.8, createdAt: '2024-02-13T00:00:00Z' },
      { id: 'edge-013', sourceId: 'guardian-008', targetId: 'guardian-002', type: 'follow', weight: 0.8, createdAt: '2024-02-14T00:00:00Z' },
      { id: 'edge-014', sourceId: 'guardian-009', targetId: 'guardian-004', type: 'follow', weight: 0.8, createdAt: '2024-02-15T00:00:00Z' },
      { id: 'edge-015', sourceId: 'guardian-010', targetId: 'guardian-005', type: 'follow', weight: 0.8, createdAt: '2024-02-16T00:00:00Z' },
      
      // Regular users interact with each other
      { id: 'edge-016', sourceId: 'guardian-006', targetId: 'guardian-007', type: 'follow', weight: 0.5, createdAt: '2024-03-01T00:00:00Z' },
      { id: 'edge-017', sourceId: 'guardian-007', targetId: 'guardian-008', type: 'follow', weight: 0.5, createdAt: '2024-03-02T00:00:00Z' },
      { id: 'edge-018', sourceId: 'guardian-008', targetId: 'guardian-009', type: 'reply', weight: 0.5, createdAt: '2024-03-03T00:00:00Z' },
      { id: 'edge-019', sourceId: 'guardian-009', targetId: 'guardian-010', type: 'reply', weight: 0.5, createdAt: '2024-03-04T00:00:00Z' },
      
      // Low reputation accounts have few connections
      { id: 'edge-020', sourceId: 'guardian-011', targetId: 'guardian-006', type: 'follow', weight: 0.3, createdAt: '2024-11-05T00:00:00Z' },
      { id: 'edge-021', sourceId: 'guardian-012', targetId: 'guardian-007', type: 'follow', weight: 0.3, createdAt: '2024-11-11T00:00:00Z' },
      { id: 'edge-022', sourceId: 'guardian-013', targetId: 'guardian-008', type: 'reply', weight: 0.2, createdAt: '2024-11-16T00:00:00Z' },
      
      // Some reverse follows (trust signal from regular users to trusted ones)
      { id: 'edge-023', sourceId: 'guardian-001', targetId: 'guardian-006', type: 'follow', weight: 0.7, createdAt: '2024-04-01T00:00:00Z' },
      { id: 'edge-024', sourceId: 'guardian-002', targetId: 'guardian-007', type: 'follow', weight: 0.7, createdAt: '2024-04-02T00:00:00Z' },
    ];

    // Insert subjects
    for (const subject of subjects) {
      try {
        SubjectRepository.create(subject);
      } catch (error) {
        // Ignore duplicates
      }
    }

    // Insert edges
    for (const edge of edges) {
      try {
        EdgeRepository.create(edge);
      } catch (error) {
        // Ignore duplicates
      }
    }

    console.log(`[VeritasOS] Created ${subjects.length} subjects and ${edges.length} edges`);
    console.log('[VeritasOS] Mock data generation completed!');
  }
}
