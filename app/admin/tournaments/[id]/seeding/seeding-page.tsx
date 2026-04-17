"use client";

import { useState, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, closestCorners } from "@dnd-kit/core";
import ThemeToggle from "@/components/theme-toggle";
import TierColumn from "@/components/admin/tier-column";
import TeamCard from "@/components/admin/team-card";
import MobileFallback from "@/components/admin/mobile-fallback";
import type { Team, TierConfig, SeedingConfig } from "@/types/admin";

interface SeedingPageProps {
  tournamentId: string;
  tournamentName: string;
  apiId: string;
}

export default function SeedingPage({ tournamentId, tournamentName, apiId }: SeedingPageProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [unassignedTeams, setUnassignedTeams] = useState<Team[]>([]);
  const [tier1Teams, setTier1Teams] = useState<Team[]>([]);
  const [tier2Teams, setTier2Teams] = useState<Team[]>([]);
  const [tier3Teams, setTier3Teams] = useState<Team[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch teams and existing seeding
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch teams
        const teamsResponse = await fetch(`/api/admin/tournaments/${tournamentId}/teams`);
        if (!teamsResponse.ok) {
          const errorData = await teamsResponse.json();
          throw new Error(errorData.error || "Failed to fetch teams");
        }
        const teamsData = await teamsResponse.json();
        const fetchedTeams: Team[] = teamsData.teams.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          shortName: t.shortName,
          tla: t.tla,
          crest: t.crest,
        }));

        setTeams(fetchedTeams);

        // Fetch existing seeding config
        const seedingResponse = await fetch(`/api/admin/tournaments/${tournamentId}/seeding`);
        if (seedingResponse.ok) {
          const seedingData = await seedingResponse.json();
          if (seedingData.seedingConfig) {
            loadSeedingConfig(seedingData.seedingConfig, fetchedTeams);
          } else {
            setUnassignedTeams(fetchedTeams);
          }
        } else {
          setUnassignedTeams(fetchedTeams);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tournamentId]);

  const loadSeedingConfig = (config: SeedingConfig, allTeams: Team[]) => {
    const tier1 = config.tiers.find((t) => t.tier === 1)?.teams || [];
    const tier2 = config.tiers.find((t) => t.tier === 2)?.teams || [];
    const tier3 = config.tiers.find((t) => t.tier === 3)?.teams || [];

    setTier1Teams(tier1);
    setTier2Teams(tier2);
    setTier3Teams(tier3);

    const assignedIds = new Set([
      ...tier1.map((t) => t.id),
      ...tier2.map((t) => t.id),
      ...tier3.map((t) => t.id),
    ]);

    setUnassignedTeams(allTeams.filter((t) => !assignedIds.has(t.id)));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const team = findTeamById(String(active.id));
    setActiveTeam(team);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTeam(null);

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // If dropped on the same container, do nothing
    if (activeId === overId) return;

    const team = findTeamById(activeId);
    if (!team) return;

    // Remove from source
    removeTeamFromAllLists(activeId);

    // Add to destination
    if (overId === "unassigned") {
      setUnassignedTeams((prev) => [...prev, team]);
    } else if (overId === "tier-1") {
      setTier1Teams((prev) => [...prev, team]);
    } else if (overId === "tier-2") {
      setTier2Teams((prev) => [...prev, team]);
    } else if (overId === "tier-3") {
      setTier3Teams((prev) => [...prev, team]);
    }
  };

  const findTeamById = (id: string): Team | null => {
    return (
      [...unassignedTeams, ...tier1Teams, ...tier2Teams, ...tier3Teams].find(
        (t) => t.id === id
      ) || null
    );
  };

  const removeTeamFromAllLists = (teamId: string) => {
    setUnassignedTeams((prev) => prev.filter((t) => t.id !== teamId));
    setTier1Teams((prev) => prev.filter((t) => t.id !== teamId));
    setTier2Teams((prev) => prev.filter((t) => t.id !== teamId));
    setTier3Teams((prev) => prev.filter((t) => t.id !== teamId));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const seedingConfig: SeedingConfig = {
        tiers: [
          { tier: 1, teams: tier1Teams },
          { tier: 2, teams: tier2Teams },
          { tier: 3, teams: tier3Teams },
        ],
        lastUpdated: new Date().toISOString(),
      };

      const response = await fetch(`/api/admin/tournaments/${tournamentId}/seeding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seedingConfig }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save seeding");
      }

      setSuccessMessage("Seeding configuration saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving seeding:", err);
      setError(err instanceof Error ? err.message : "Failed to save seeding");
    } finally {
      setSaving(false);
    }
  };

  if (isMobile) {
    return <MobileFallback tournamentName={tournamentName} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-700 dark:text-gray-300 font-body">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta">
              Tournament Seeding
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-body mt-1">
              {tournamentName}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-400 font-body">{error}</p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-6 pt-6">
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl p-4">
            <p className="text-green-700 dark:text-green-400 font-body">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        <div className="mb-8">
          <p className="text-gray-700 dark:text-gray-300 font-body mb-4">
            Drag and drop teams into tiers to create a balanced seeding configuration. This will be used for the draw algorithm.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-purple to-magenta text-white font-display rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Seeding"}
          </button>
        </div>

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-4 gap-6">
            <TierColumn
              id="unassigned"
              title="Unassigned Teams"
              teams={unassignedTeams}
              gradient="gray"
            />
            <TierColumn
              id="tier-1"
              title="Tier 1"
              subtitle="Strongest Teams"
              teams={tier1Teams}
              gradient="purple-magenta"
            />
            <TierColumn
              id="tier-2"
              title="Tier 2"
              subtitle="Medium Strength"
              teams={tier2Teams}
              gradient="orange-red"
            />
            <TierColumn
              id="tier-3"
              title="Tier 3"
              subtitle="Developing Teams"
              teams={tier3Teams}
              gradient="cyan-lime"
            />
          </div>

          <DragOverlay>
            {activeTeam ? (
              <div className="opacity-80">
                <TeamCard team={activeTeam} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </div>
  );
}
