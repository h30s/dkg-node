import { defineDkgPlugin } from "@dkg/plugins";
import { openAPIRoute, z } from "@dkg/plugin-swagger";
import { ReputationRepository } from './database/repositories/ReputationRepository';
import { SubjectRepository } from './database/repositories/SubjectRepository';
import { EdgeRepository } from './database/repositories/EdgeRepository';
import { ReputationEngine } from './services/ReputationEngine';
import { MockDataService } from './services/MockDataService';

/**
 * VeritasOS Core Plugin
 * 
 * Provides decentralized reputation scoring for AI agents and dApps.
 * Computes Sybil-resistant trust scores from social graphs and publishes
 * them as verifiable Knowledge Assets on the OriginTrail DKG.
 * 
 * This plugin is part of the VeritasOS hackathon project built on top of
 * the OriginTrail DKG Node: https://github.com/OriginTrail/dkg-node
 */
export default defineDkgPlugin((ctx, mcp, api) => {
  console.log('[VeritasOS] Initializing VeritasOS Core plugin...');

  // Initialize data on first load
  const initializeData = async () => {
    const subjectCount = SubjectRepository.count();
    if (subjectCount === 0) {
      console.log('[VeritasOS] No subjects found. Generating mock data...');
      MockDataService.generateMockData();
      
      console.log('[VeritasOS] Computing initial reputation scores...');
      const engine = new ReputationEngine();
      await engine.computeAllReputations();
      
      const stats = engine.getStatistics();
      console.log('[VeritasOS] Reputation statistics:', stats);
    } else {
      console.log(`[VeritasOS] Found ${subjectCount} existing subjects`);
    }
  };

  // Initialize asynchronously
  initializeData().catch(err => {
    console.error('[VeritasOS] Initialization error:', err);
  });

  // ============================================================================
  // REST API ENDPOINTS
  // ============================================================================

  /**
   * GET /veritasos/health - Health check
   */
  api.get(
    "/veritasos/health",
    openAPIRoute(
      {
        tag: "VeritasOS",
        summary: "Health check",
        description: "Check if VeritasOS reputation engine is running",
        response: {
          description: "Health status",
          schema: z.object({
            status: z.string(),
            timestamp: z.string(),
            service: z.string(),
          }),
        },
      },
      (req, res) => {
        res.json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          service: 'veritasos-core',
        });
      },
    ),
  );

  /**
   * GET /veritasos/stats - Database statistics
   */
  api.get(
    "/veritasos/stats",
    openAPIRoute(
      {
        tag: "VeritasOS",
        summary: "Get statistics",
        description: "Get database and reputation statistics",
        response: {
          description: "Statistics",
          schema: z.object({
            subjects: z.number(),
            edges: z.number(),
            reputationProfiles: z.number(),
          }),
        },
      },
      (req, res) => {
        try {
          const stats = {
            subjects: SubjectRepository.count(),
            edges: EdgeRepository.count(),
            reputationProfiles: ReputationRepository.count(),
          };
          res.json(stats);
        } catch (error) {
          console.error('[VeritasOS] Stats error:', error);
          res.status(500).json({ error: 'Failed to fetch statistics' });
        }
      },
    ),
  );

  /**
   * GET /veritasos/reputation/:subjectId - Get reputation by ID
   */
  api.get(
    "/veritasos/reputation/:subjectId",
    openAPIRoute(
      {
        tag: "VeritasOS",
        summary: "Get reputation by ID",
        description: "Get reputation profile for a subject by ID",
        params: z.object({
          subjectId: z.string().openapi({
            description: "Subject ID",
            example: "guardian-001",
          }),
        }),
        response: {
          description: "Reputation profile",
          schema: z.object({
            subject: z.object({
              id: z.string(),
              handle: z.string().optional(),
              displayName: z.string().optional(),
              type: z.string(),
            }),
            reputation: z.object({
              overallScore: z.number(),
              scores: z.object({
                global: z.number(),
                networkTrust: z.number().optional(),
                misinfoResistance: z.number().optional(),
              }),
              algorithmVersion: z.string(),
              computedAt: z.string(),
              ual: z.string().optional(),
              explanation: z.string().optional(),
            }),
          }),
        },
      },
      (req, res) => {
        try {
          const { subjectId } = req.params;
          
          const subject = SubjectRepository.findById(subjectId);
          if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
          }

          const profile = ReputationRepository.findBySubjectId(subjectId);
          if (!profile) {
            return res.status(404).json({ error: 'Reputation profile not found' });
          }

          res.json({
            subject: {
              id: subject.id,
              handle: subject.handle,
              displayName: subject.displayName,
              type: subject.type,
            },
            reputation: {
              overallScore: profile.overallScore,
              scores: profile.scores,
              algorithmVersion: profile.algorithmVersion,
              computedAt: profile.computedAt,
              ual: profile.ual,
              explanation: profile.explanation,
            },
          });
        } catch (error) {
          console.error('[VeritasOS] Reputation query error:', error);
          res.status(500).json({ error: 'Failed to fetch reputation' });
        }
      },
    ),
  );

  /**
   * GET /veritasos/reputation/by-handle/:handle - Get reputation by handle
   */
  api.get(
    "/veritasos/reputation/by-handle/:handle",
    openAPIRoute(
      {
        tag: "VeritasOS",
        summary: "Get reputation by handle",
        description: "Get reputation profile for a subject by handle (e.g., @factchecker_alice)",
        params: z.object({
          handle: z.string().openapi({
            description: "Subject handle (with or without @ prefix)",
            example: "factchecker_alice",
          }),
        }),
        response: {
          description: "Reputation profile",
          schema: z.object({
            subject: z.object({
              id: z.string(),
              handle: z.string().optional(),
              displayName: z.string().optional(),
              type: z.string(),
            }),
            reputation: z.object({
              overallScore: z.number(),
              scores: z.object({
                global: z.number(),
                networkTrust: z.number().optional(),
                misinfoResistance: z.number().optional(),
              }),
              algorithmVersion: z.string(),
              computedAt: z.string(),
              ual: z.string().optional(),
              explanation: z.string().optional(),
            }),
          }),
        },
      },
      (req, res) => {
        try {
          let { handle } = req.params;
          
          // Add @ prefix if not present
          if (!handle.startsWith('@')) {
            handle = '@' + handle;
          }
          
          const subject = SubjectRepository.findByHandle(handle);
          if (!subject) {
            return res.status(404).json({ error: 'Subject not found' });
          }

          const profile = ReputationRepository.findBySubjectId(subject.id);
          if (!profile) {
            return res.status(404).json({ error: 'Reputation profile not found' });
          }

          res.json({
            subject: {
              id: subject.id,
              handle: subject.handle,
              displayName: subject.displayName,
              type: subject.type,
            },
            reputation: {
              overallScore: profile.overallScore,
              scores: profile.scores,
              algorithmVersion: profile.algorithmVersion,
              computedAt: profile.computedAt,
              ual: profile.ual,
              explanation: profile.explanation,
            },
          });
        } catch (error) {
          console.error('[VeritasOS] Reputation query by handle error:', error);
          res.status(500).json({ error: 'Failed to fetch reputation' });
        }
      },
    ),
  );

  /**
   * GET /veritasos/top - Get top N subjects by reputation
   */
  api.get(
    "/veritasos/top",
    openAPIRoute(
      {
        tag: "VeritasOS",
        summary: "Get top trusted identities",
        description: "Get top N subjects ranked by reputation score",
        query: z.object({
          limit: z.number({ coerce: true }).optional().default(20).openapi({
            description: "Number of results to return",
            example: 20,
          }),
        }),
        response: {
          description: "List of top reputation profiles",
          schema: z.array(z.object({
            subject: z.object({
              id: z.string(),
              handle: z.string().optional(),
              displayName: z.string().optional(),
              type: z.string(),
            }).nullable(),
            reputation: z.object({
              overallScore: z.number(),
              scores: z.object({
                global: z.number(),
                networkTrust: z.number().optional(),
                misinfoResistance: z.number().optional(),
              }),
              algorithmVersion: z.string(),
              computedAt: z.string(),
              ual: z.string().optional(),
              explanation: z.string().optional(),
            }),
          })),
        },
      },
      (req, res) => {
        try {
          const limit = req.query.limit || 20;
          const profiles = ReputationRepository.findTopN(limit);

          const results = profiles.map(profile => {
            const subject = SubjectRepository.findById(profile.subjectId);
            return {
              subject: subject ? {
                id: subject.id,
                handle: subject.handle,
                displayName: subject.displayName,
                type: subject.type,
              } : null,
              reputation: {
                overallScore: profile.overallScore,
                scores: profile.scores,
                algorithmVersion: profile.algorithmVersion,
                computedAt: profile.computedAt,
                ual: profile.ual,
                explanation: profile.explanation,
              },
            };
          });

          res.json(results);
        } catch (error) {
          console.error('[VeritasOS] Top query error:', error);
          res.status(500).json({ error: 'Failed to fetch top reputations' });
        }
      },
    ),
  );

  console.log('[VeritasOS] Core plugin initialized successfully');
});

// Export types for use by other plugins
export * from './types';
export { ReputationEngine } from './services/ReputationEngine';
export { DkgClient } from './services/DkgClient';
export { SubjectRepository } from './database/repositories/SubjectRepository';
export { EdgeRepository } from './database/repositories/EdgeRepository';
export { ReputationRepository } from './database/repositories/ReputationRepository';
