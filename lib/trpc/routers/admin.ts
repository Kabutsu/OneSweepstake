import { z } from "zod";
import { router, protectedProcedure } from "../init";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { fetchCompetitionTeams } from "@/lib/football-data";
import type { SeedingConfig } from "@/types/admin";

// Zod schema for tier config
const tierConfigSchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  teams: z.array(z.object({
    id: z.string(),
    name: z.string(),
    shortName: z.string(),
    tla: z.string(),
    crest: z.string(),
  })),
});

// Zod schema for seeding config
const seedingConfigSchema = z.object({
  tiers: z.array(tierConfigSchema),
  lastUpdated: z.string(),
});

export const adminRouter = router({
  /**
   * Get tournament seeding configuration
   */
  getTournamentSeeding: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      const tournament = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, input.id))
        .limit(1);

      if (!tournament || tournament.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      }

      return {
        seedingConfig: tournament[0].seedingConfig as SeedingConfig | null,
      };
    }),

  /**
   * Update tournament seeding configuration
   */
  updateTournamentSeeding: protectedProcedure
    .input(z.object({
      id: z.string(),
      seedingConfig: seedingConfigSchema,
    }))
    .mutation(async ({ input }) => {
      // Validate seeding config structure
      if (!input.seedingConfig || !Array.isArray(input.seedingConfig.tiers)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid seeding configuration",
        });
      }

      try {
        await db
          .update(tournaments)
          .set({
            seedingConfig: input.seedingConfig,
            updatedAt: new Date(),
          })
          .where(eq(tournaments.id, input.id));

        return {
          success: true,
          seedingConfig: input.seedingConfig,
        };
      } catch (error) {
        console.error("Error saving seeding config:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to save seeding configuration",
        });
      }
    }),

  /**
   * Get teams for a tournament from Football-Data.org
   */
  getTournamentTeams: protectedProcedure
    .input(z.object({
      id: z.string(),
    }))
    .query(async ({ input }) => {
      // Get tournament details
      const tournament = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, input.id))
        .limit(1);

      if (!tournament || tournament.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      }

      try {
        // Fetch teams from Football-Data.org using the tournament's apiId
        const teams = await fetchCompetitionTeams(tournament[0].apiId);

        return { teams };
      } catch (error) {
        console.error("Error fetching teams:", error);
        const message = error instanceof Error ? error.message : "Failed to fetch teams";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message,
        });
      }
    }),
});
