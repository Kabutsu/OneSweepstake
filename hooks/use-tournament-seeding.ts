"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import type { Team, SeedingConfig } from "@/types/admin";

interface UseTournamentSeedingResult {
  teams: Team[];
  seedingConfig: SeedingConfig | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTournamentSeeding(tournamentId: string): UseTournamentSeedingResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [seedingConfig, setSeedingConfig] = useState<SeedingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const teamsQuery = trpc.admin.getTournamentTeams.useQuery(
    { id: tournamentId },
    { enabled: false }
  );

  const seedingQuery = trpc.admin.getTournamentSeeding.useQuery(
    { id: tournamentId },
    { enabled: false }
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch teams and seeding config in parallel
      const [teamsResult, seedingResult] = await Promise.all([
        teamsQuery.refetch(),
        seedingQuery.refetch(),
      ]);

      if (teamsResult.error) {
        throw new Error(teamsResult.error.message);
      }

      if (seedingResult.error) {
        throw new Error(seedingResult.error.message);
      }

      const fetchedTeams: Team[] = (teamsResult.data?.teams || []).map((t: any) => ({
        id: String(t.id),
        name: t.name,
        shortName: t.shortName,
        tla: t.tla,
        crest: t.crest,
      }));

      setTeams(fetchedTeams);
      setSeedingConfig(seedingResult.data?.seedingConfig || null);
    } catch (err) {
      console.error("Error fetching tournament data:", err);
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tournamentId]);

  return {
    teams,
    seedingConfig,
    loading,
    error,
    refetch: fetchData,
  };
}
