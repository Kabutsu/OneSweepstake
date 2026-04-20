import { router, protectedProcedure, publicProcedure } from "../init";
import { db } from "@/db";
import { sweepstakes, participants, tournaments, users } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Generate a unique join code for a sweepstake
 */
function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Removed ambiguous characters
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Check if a join code is unique
 */
async function getUniqueJoinCode(): Promise<string> {
  let code = generateJoinCode();
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const existing = await db
      .select({ id: sweepstakes.id })
      .from(sweepstakes)
      .where(eq(sweepstakes.joinCode, code))
      .limit(1);

    if (existing.length === 0) {
      return code;
    }

    code = generateJoinCode();
    attempts++;
  }

  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to generate unique join code",
  });
}

export const sweepstakesRouter = router({
  /**
   * Create a new sweepstake
   */
  create: protectedProcedure
    .input(
      z.object({
        tournamentId: z.string().uuid(),
        name: z.string().min(1).max(100),
        maxParticipants: z.number().int().min(2).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get tournament to validate it exists and get team count
      const tournament = await db
        .select()
        .from(tournaments)
        .where(eq(tournaments.id, input.tournamentId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!tournament) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Tournament not found",
        });
      }

      // Default max participants to tournament team count
      const maxParticipants = input.maxParticipants ?? tournament.teamCount;

      // Validate max participants doesn't exceed team count
      if (maxParticipants > tournament.teamCount) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Maximum participants cannot exceed tournament team count (${tournament.teamCount})`,
        });
      }

      // Generate unique join code
      const joinCode = await getUniqueJoinCode();

      // Create sweepstake
      const [newSweepstake] = await db
        .insert(sweepstakes)
        .values({
          tournamentId: input.tournamentId,
          name: input.name,
          creatorId: ctx.user.id,
          joinCode,
          isPrivate: false, // Slice 4 is public only
          maxParticipants,
          currentParticipants: 1, // Creator is automatically a participant
        })
        .returning();

      // Automatically add creator as a participant
      await db.insert(participants).values({
        sweepstakeId: newSweepstake.id,
        userId: ctx.user.id,
      });

      return {
        sweepstake: newSweepstake,
      };
    }),

  /**
   * Join a sweepstake by ID
   */
  join: protectedProcedure
    .input(
      z.object({
        sweepstakeId: z.string().uuid(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Get sweepstake
      const sweepstake = await db
        .select()
        .from(sweepstakes)
        .where(eq(sweepstakes.id, input.sweepstakeId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!sweepstake) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sweepstake not found",
        });
      }

      // Check if already a participant
      const existingParticipant = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.sweepstakeId, input.sweepstakeId),
            eq(participants.userId, ctx.user.id)
          )
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (existingParticipant) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already a participant in this sweepstake",
        });
      }

      // Check if sweepstake is full
      if (sweepstake.currentParticipants >= sweepstake.maxParticipants) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "This sweepstake is full",
        });
      }

      // Add participant and update count
      await db.transaction(async (tx) => {
        await tx.insert(participants).values({
          sweepstakeId: input.sweepstakeId,
          userId: ctx.user.id,
        });

        await tx
          .update(sweepstakes)
          .set({
            currentParticipants: sweepstake.currentParticipants + 1,
          })
          .where(eq(sweepstakes.id, input.sweepstakeId));
      });

      return { success: true };
    }),

  /**
   * Get sweepstake details by ID
   */
  getSweepstake: publicProcedure
    .input(
      z.object({
        sweepstakeId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const sweepstake = await db
        .select({
          id: sweepstakes.id,
          name: sweepstakes.name,
          joinCode: sweepstakes.joinCode,
          isPrivate: sweepstakes.isPrivate,
          maxParticipants: sweepstakes.maxParticipants,
          currentParticipants: sweepstakes.currentParticipants,
          createdAt: sweepstakes.createdAt,
          tournamentId: sweepstakes.tournamentId,
          tournamentName: tournaments.name,
          tournamentLogo: tournaments.logo,
          creatorId: sweepstakes.creatorId,
          creatorDisplayName: users.displayName,
        })
        .from(sweepstakes)
        .leftJoin(tournaments, eq(sweepstakes.tournamentId, tournaments.id))
        .leftJoin(users, eq(sweepstakes.creatorId, users.id))
        .where(eq(sweepstakes.id, input.sweepstakeId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!sweepstake) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Sweepstake not found",
        });
      }

      return { sweepstake };
    }),

  /**
   * Get participants for a sweepstake
   */
  getParticipants: publicProcedure
    .input(
      z.object({
        sweepstakeId: z.string().uuid(),
      })
    )
    .query(async ({ input }) => {
      const participantList = await db
        .select({
          id: participants.id,
          userId: users.id,
          displayName: users.displayName,
          avatarUrl: users.avatarUrl,
          joinedAt: participants.joinedAt,
        })
        .from(participants)
        .leftJoin(users, eq(participants.userId, users.id))
        .where(eq(participants.sweepstakeId, input.sweepstakeId))
        .orderBy(participants.joinedAt);

      return { participants: participantList };
    }),

  /**
   * List public sweepstakes (optionally filtered by tournament)
   */
  listPublic: publicProcedure
    .input(
      z
        .object({
          tournamentId: z.string().uuid().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let query = db
        .select({
          id: sweepstakes.id,
          name: sweepstakes.name,
          joinCode: sweepstakes.joinCode,
          maxParticipants: sweepstakes.maxParticipants,
          currentParticipants: sweepstakes.currentParticipants,
          createdAt: sweepstakes.createdAt,
          tournamentId: sweepstakes.tournamentId,
          tournamentName: tournaments.name,
          tournamentLogo: tournaments.logo,
          creatorDisplayName: users.displayName,
        })
        .from(sweepstakes)
        .leftJoin(tournaments, eq(sweepstakes.tournamentId, tournaments.id))
        .leftJoin(users, eq(sweepstakes.creatorId, users.id))
        .where(eq(sweepstakes.isPrivate, false))
        .$dynamic();

      if (input?.tournamentId) {
        query = query.where(
          and(
            eq(sweepstakes.isPrivate, false),
            eq(sweepstakes.tournamentId, input.tournamentId)
          )
        );
      }

      const publicSweepstakes = await query.orderBy(desc(sweepstakes.createdAt));

      return { sweepstakes: publicSweepstakes };
    }),

  /**
   * Check if current user is a participant in a sweepstake
   */
  checkParticipation: protectedProcedure
    .input(
      z.object({
        sweepstakeId: z.string().uuid(),
      })
    )
    .query(async ({ ctx, input }) => {
      const participant = await db
        .select()
        .from(participants)
        .where(
          and(
            eq(participants.sweepstakeId, input.sweepstakeId),
            eq(participants.userId, ctx.user.id)
          )
        )
        .limit(1)
        .then((rows) => rows[0]);

      return { isParticipant: !!participant };
    }),
});
