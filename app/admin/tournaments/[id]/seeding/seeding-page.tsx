"use client";

import { useState, useEffect } from "react";
import { DndContext, DragOverlay, closestCorners } from "@dnd-kit/core";
import { trpc } from "@/lib/trpc/client";
import { useTournamentSeeding } from "@/hooks/use-tournament-seeding";
import { useTierManagement } from "@/hooks/use-tier-management";
import { useDragAndDrop } from "@/hooks/use-drag-and-drop";
import {
  SeedingPageHeader,
  SeedingPageLoading,
  SeedingControls,
  TierGrid,
  TeamCard,
} from "@/components/admin/seeding";
import { MessageBanner, MobileFallback } from "@/components/admin/shared";

interface SeedingPageProps {
  tournamentId: string;
  tournamentName: string;
  apiId: string;
}

export default function SeedingPage({ tournamentId, tournamentName }: SeedingPageProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Fetch tournament data
  const { teams, seedingConfig, loading, error: fetchError } = useTournamentSeeding(tournamentId);

  // Manage tier state
  const tierManagement = useTierManagement(teams, seedingConfig);

  // Handle drag and drop
  const { activeTeam, handleDragStart, handleDragEnd } = useDragAndDrop(
    tierManagement.findTeamById,
    tierManagement.moveTeam
  );

  // TRPC mutation for saving
  const saveMutation = trpc.admin.updateTournamentSeeding.useMutation({
    onSuccess: () => {
      setSuccessMessage("Seeding configuration saved successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setSaving(false);
    },
    onError: (err) => {
      setError(err.message);
      setSaving(false);
    },
  });

  // Check if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const seedingConfig = tierManagement.getSeedingConfig();
    saveMutation.mutate({
      id: tournamentId,
      seedingConfig,
    });
  };

  if (isMobile) {
    return <MobileFallback tournamentName={tournamentName} />;
  }

  if (loading) {
    return <SeedingPageLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      <SeedingPageHeader tournamentName={tournamentName} />

      {(error || fetchError) && <MessageBanner type="error" message={error || fetchError || ""} />}
      {successMessage && <MessageBanner type="success" message={successMessage} />}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative">
        <SeedingControls onSave={handleSave} saving={saving} />

        <DndContext
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <TierGrid
            unassignedTeams={tierManagement.unassignedTeams}
            tier1Teams={tierManagement.tier1Teams}
            tier2Teams={tierManagement.tier2Teams}
            tier3Teams={tierManagement.tier3Teams}
          />

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
