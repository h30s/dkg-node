import { defineDkgPlugin } from "@dkg/plugins";
import { z } from "@dkg/plugin-swagger";
import { withSourceKnowledgeAssets } from "@dkg/plugin-dkg-essentials/utils";
import { 
  SubjectRepository, 
  ReputationRepository 
} from "@dkg/plugin-veritasos-core";

/**
 * VeritasOS MCP Plugin
 * 
 * Provides Model Context Protocol (MCP) tools for AI agents to query
 * reputation scores and make trust-based decisions.
 * 
 * This plugin is part of the VeritasOS hackathon project built on top of
 * the OriginTrail DKG Node: https://github.com/OriginTrail/dkg-node
 */
export default defineDkgPlugin((ctx, mcp, api) => {
  console.log('[VeritasOS MCP] Initializing MCP tools for AI agents...');

  /**
   * MCP Tool: trust_getReputation
   * 
   * Get reputation score for a subject (identity, account, or address)
   * Returns actionable trust recommendations for AI agents
   */
  mcp.registerTool(
    "trust_getReputation",
    {
      title: "Get Reputation Score",
      description: "Get reputation score for a subject (identity, account, or address). Returns trust level and actionable recommendation for AI decision-making.",
      inputSchema: {
        subjectId: z.string().describe("The ID or handle of the subject to query (e.g., '@factchecker_alice' or 'guardian-001')"),
        context: z.string().optional().describe("Optional context for the query (e.g., 'misinformation', 'networking')"),
      },
    },
    async ({ subjectId, context }) => {
      try {
        // Try to find by ID first
        let subject = SubjectRepository.findById(subjectId);
        
        // If not found and starts with @, try handle
        if (!subject && subjectId.startsWith('@')) {
          subject = SubjectRepository.findByHandle(subjectId);
        }
        
        if (!subject) {
          return withSourceKnowledgeAssets(
            {
              content: [{
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: 'Subject not found',
                  recommendation: 'DO_NOT_TRUST',
                  explanation: 'The requested identity does not exist in the reputation database.',
                }, null, 2),
              }],
            },
            [],
          );
        }

        const reputation = ReputationRepository.findBySubjectId(subject.id);
        
        if (!reputation) {
          return withSourceKnowledgeAssets(
            {
              content: [{
                type: "text",
                text: JSON.stringify({
                  success: false,
                  error: 'Reputation profile not available',
                  recommendation: 'PROCEED_WITH_CAUTION',
                  explanation: 'This identity exists but has no computed reputation score yet.',
                }, null, 2),
              }],
            },
            [],
          );
        }

        // Generate trust recommendation based on score
        let recommendation = 'DO_NOT_TRUST';
        let trustLevel = 'LOW';
        
        if (reputation.overallScore >= 0.7) {
          recommendation = 'TRUST';
          trustLevel = 'HIGH';
        } else if (reputation.overallScore >= 0.4) {
          recommendation = 'VERIFY_BEFORE_TRUST';
          trustLevel = 'MODERATE';
        }

        const result = {
          success: true,
          subject: {
            id: subject.id,
            handle: subject.handle,
            displayName: subject.displayName,
            type: subject.type,
          },
          reputation: {
            overallScore: reputation.overallScore,
            trustLevel,
            scores: reputation.scores,
            explanation: reputation.explanation,
            dkgAssetUAL: reputation.ual,
          },
          recommendation,
          computedAt: reputation.computedAt,
          context: context || 'general',
        };

        // Build source knowledge assets if UAL exists
        const sources = reputation.ual ? [{
          title: `Reputation Profile: ${subject.displayName || subject.handle}`,
          issuer: 'VeritasOS Reputation Engine',
          ual: reputation.ual,
        }] : [];

        return withSourceKnowledgeAssets(
          {
            content: [{
              type: "text",
              text: JSON.stringify(result, null, 2),
            }],
          },
          sources,
        );
      } catch (error) {
        return withSourceKnowledgeAssets(
          {
            content: [{
              type: "text",
              text: JSON.stringify({
                success: false,
                error: 'Failed to query reputation',
                recommendation: 'PROCEED_WITH_CAUTION',
                details: error instanceof Error ? error.message : 'Unknown error',
              }, null, 2),
            }],
          },
          [],
        );
      }
    },
  );

  /**
   * MCP Tool: trust_getContentTrust
   * 
   * Evaluate trust score for content (URL, post, or resource)
   * Note: This is a placeholder for future implementation
   */
  mcp.registerTool(
    "trust_getContentTrust",
    {
      title: "Get Content Trust Score",
      description: "Evaluate trust score for content (URL, post, or resource). Returns credibility assessment.",
      inputSchema: {
        contentUrlOrId: z.string().describe("The URL or ID of the content to evaluate"),
      },
    },
    async ({ contentUrlOrId }) => {
      // Mock implementation for hackathon
      // In production, this would check content against fact-check database
      return withSourceKnowledgeAssets(
        {
          content: [{
            type: "text",
            text: JSON.stringify({
              success: true,
              contentId: contentUrlOrId,
              verdict: 'UNKNOWN',
              confidence: 0.0,
              message: 'Content trust evaluation not yet implemented in MVP',
              recommendation: 'VERIFY_INDEPENDENTLY',
            }, null, 2),
          }],
        },
        [],
      );
    },
  );

  /**
   * API Endpoint: List available MCP tools
   */
  api.get("/veritasos/mcp/tools", (req, res) => {
    res.json({
      success: true,
      tools: [
        {
          name: 'trust_getReputation',
          description: 'Get reputation score for a subject (identity, account, or address)',
          parameters: {
            subjectId: 'string (required)',
            context: 'string (optional)',
          },
          returns: 'Reputation profile with trust recommendation',
        },
        {
          name: 'trust_getContentTrust',
          description: 'Evaluate trust score for content (URL, post, or resource)',
          parameters: {
            contentUrlOrId: 'string (required)',
          },
          returns: 'Content credibility assessment',
        },
      ],
      server: 'veritasos-mcp-v1',
      description: 'Model Context Protocol tools for reputation queries',
    });
  });

  console.log('[VeritasOS MCP] MCP tools registered successfully');
});
