import { router, publicProcedure } from "../init";
import { db } from "@/db";
import { tournaments } from "@/db/schema";
import { desc } from "drizzle-orm";

export const tournamentsRouter = router({
  /**
   * List all active tournaments (public access)
   */
  listTournaments: publicProcedure
    .query(async () => {
      const allTournaments = await db
        .select()
        .from(tournaments)
        .orderBy(desc(tournaments.startDate));

      return { tournaments: allTournaments };
    }),
});
