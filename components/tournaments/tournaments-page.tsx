"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import TournamentCard from "@/components/tournaments/tournament-card";
import TournamentFilter from "@/components/tournaments/tournament-filter";
import LoadingState from "@/components/loading-state";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";
import type { TournamentStatus, TournamentWithStatus } from "@/types/tournaments";
import { getTournamentStatus } from "@/types/tournaments";

export default function TournamentsPage() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<"all" | TournamentStatus>("all");

  const { data, isLoading, error } = trpc.tournaments.listTournaments.useQuery();

  const tournamentsWithStatus: TournamentWithStatus[] = useMemo(() => {
    if (!data?.tournaments) return [];

    return data.tournaments.map((tournament) => ({
      ...tournament,
      status: getTournamentStatus(new Date(tournament.startDate), new Date(tournament.endDate)),
    }));
  }, [data]);

  const filteredTournaments = useMemo(() => {
    if (selectedFilter === "all") return tournamentsWithStatus;
    return tournamentsWithStatus.filter((t) => t.status === selectedFilter);
  }, [tournamentsWithStatus, selectedFilter]);

  const handleCreateSweepstake = (tournamentId: string) => {
    // TODO: Navigate to sweepstake creation page
    console.log("Create sweepstake for tournament:", tournamentId);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Tournaments</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta">
              OneSweepstake
            </h1>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title and Description */}
        <div className="mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Browse Tournaments
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose a tournament to create your sweepstake and start competing with friends
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <TournamentFilter selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        </div>

        {/* Tournaments Grid */}
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400">
              No {selectedFilter !== "all" ? selectedFilter : ""} tournaments found
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <TournamentCard
                key={tournament.id}
                tournament={tournament}
                onCreateSweepstake={handleCreateSweepstake}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
