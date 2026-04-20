"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import SweepstakeCard from "@/components/sweepstakes/sweepstake-card";
import LoadingState from "@/components/loading-state";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";

export default function SweepstakesPage() {
  const router = useRouter();
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { data, isLoading, error } = trpc.sweepstakes.listPublic.useQuery();
  const joinMutation = trpc.sweepstakes.join.useMutation();

  const handleJoin = async (sweepstakeId: string) => {
    setJoiningId(sweepstakeId);
    try {
      await joinMutation.mutateAsync({ sweepstakeId });
      // Navigate to lobby on success
      router.push(`/sweepstakes/${sweepstakeId}`);
    } catch (error) {
      console.error("Failed to join sweepstake:", error);
      setJoiningId(null);
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Sweepstakes</h2>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  const sweepstakes = data?.sweepstakes || [];

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
            Browse Sweepstakes
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Join public sweepstakes and compete with others
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8 flex gap-4 border-b border-gray-200 dark:border-gray-800">
          <button
            onClick={() => router.push("/tournaments")}
            className="pb-3 px-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors"
          >
            Tournaments
          </button>
          <button
            className="pb-3 px-1 text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta font-semibold border-b-2 border-purple"
          >
            Public Sweepstakes
          </button>
        </div>

        {/* Sweepstakes Grid */}
        {sweepstakes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-4">
              No public sweepstakes available yet
            </p>
            <button
              onClick={() => router.push("/tournaments")}
              className="inline-block px-6 py-3 bg-gradient-to-r from-purple to-magenta text-white font-semibold rounded-lg hover:shadow-lg transition-all"
            >
              Create Your Own
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sweepstakes.map((sweepstake) => (
              <SweepstakeCard
                key={sweepstake.id}
                sweepstake={sweepstake}
                onJoin={handleJoin}
                isJoining={joiningId === sweepstake.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
