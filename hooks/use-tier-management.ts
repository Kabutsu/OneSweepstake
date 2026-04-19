"use client";

import { useState, useCallback, useEffect } from "react";
import type { Team, SeedingConfig } from "@/types/admin";

interface UseTierManagementResult {
  unassignedTeams: Team[];
  tier1Teams: Team[];
  tier2Teams: Team[];
  tier3Teams: Team[];
  moveTeam: (teamId: string, targetTier: "unassigned" | "tier-1" | "tier-2" | "tier-3") => void;
  findTeamById: (teamId: string) => Team | null;
  getSeedingConfig: () => SeedingConfig;
}

export function useTierManagement(
  allTeams: Team[],
  initialConfig: SeedingConfig | null
): UseTierManagementResult {
  const [unassignedTeams, setUnassignedTeams] = useState<Team[]>([]);
  const [tier1Teams, setTier1Teams] = useState<Team[]>([]);
  const [tier2Teams, setTier2Teams] = useState<Team[]>([]);
  const [tier3Teams, setTier3Teams] = useState<Team[]>([]);

  // Initialize tiers from config or all teams
  useEffect(() => {
    if (initialConfig) {
      const tier1 = initialConfig.tiers.find((t) => t.tier === 1)?.teams || [];
      const tier2 = initialConfig.tiers.find((t) => t.tier === 2)?.teams || [];
      const tier3 = initialConfig.tiers.find((t) => t.tier === 3)?.teams || [];

      setTier1Teams(tier1);
      setTier2Teams(tier2);
      setTier3Teams(tier3);

      const assignedIds = new Set([
        ...tier1.map((t) => t.id),
        ...tier2.map((t) => t.id),
        ...tier3.map((t) => t.id),
      ]);

      setUnassignedTeams(allTeams.filter((t) => !assignedIds.has(t.id)));
    } else {
      setUnassignedTeams(allTeams);
      setTier1Teams([]);
      setTier2Teams([]);
      setTier3Teams([]);
    }
  }, [allTeams, initialConfig]);

  const findTeamById = useCallback(
    (id: string): Team | null => {
      return (
        [...unassignedTeams, ...tier1Teams, ...tier2Teams, ...tier3Teams].find(
          (t) => t.id === id
        ) || null
      );
    },
    [unassignedTeams, tier1Teams, tier2Teams, tier3Teams]
  );

  const removeTeamFromAllLists = useCallback((teamId: string) => {
    setUnassignedTeams((prev) => prev.filter((t) => t.id !== teamId));
    setTier1Teams((prev) => prev.filter((t) => t.id !== teamId));
    setTier2Teams((prev) => prev.filter((t) => t.id !== teamId));
    setTier3Teams((prev) => prev.filter((t) => t.id !== teamId));
  }, []);

  const moveTeam = useCallback(
    (teamId: string, targetTier: "unassigned" | "tier-1" | "tier-2" | "tier-3") => {
      const team = findTeamById(teamId);
      if (!team) return;

      removeTeamFromAllLists(teamId);

      switch (targetTier) {
        case "unassigned":
          setUnassignedTeams((prev) => [...prev, team]);
          break;
        case "tier-1":
          setTier1Teams((prev) => [...prev, team]);
          break;
        case "tier-2":
          setTier2Teams((prev) => [...prev, team]);
          break;
        case "tier-3":
          setTier3Teams((prev) => [...prev, team]);
          break;
      }
    },
    [findTeamById, removeTeamFromAllLists]
  );

  const getSeedingConfig = useCallback((): SeedingConfig => {
    return {
      tiers: [
        { tier: 1, teams: tier1Teams },
        { tier: 2, teams: tier2Teams },
        { tier: 3, teams: tier3Teams },
      ],
      lastUpdated: new Date().toISOString(),
    };
  }, [tier1Teams, tier2Teams, tier3Teams]);

  return {
    unassignedTeams,
    tier1Teams,
    tier2Teams,
    tier3Teams,
    moveTeam,
    findTeamById,
    getSeedingConfig,
  };
}
