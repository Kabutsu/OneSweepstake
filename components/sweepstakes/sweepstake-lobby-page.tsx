"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { trpc } from "@/lib/trpc/client";
import { createClient } from "@/lib/supabase/client";
import LoadingState from "@/components/loading-state";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";
import type { SweepstakeParticipant } from "@/types/sweepstakes";

interface SweepstakeLobbyPageProps {
  sweepstakeId: string;
  userId: string;
}

export default function SweepstakeLobbyPage({ sweepstakeId, userId }: SweepstakeLobbyPageProps) {
  const router = useRouter();
  const [participants, setParticipants] = useState<SweepstakeParticipant[]>([]);

  const { data: sweepstakeData, isLoading: loadingSweepstake, error: sweepstakeError } =
    trpc.sweepstakes.getSweepstake.useQuery({ sweepstakeId });

  const { data: participantsData, isLoading: loadingParticipants } =
    trpc.sweepstakes.getParticipants.useQuery({ sweepstakeId });

  const { data: participationData } =
    trpc.sweepstakes.checkParticipation.useQuery({ sweepstakeId });

  const joinMutation = trpc.sweepstakes.join.useMutation();
  const utils = trpc.useUtils();

  const sweepstake = sweepstakeData?.sweepstake;
  const isParticipant = participationData?.isParticipant ?? false;
  const isFull = sweepstake
    ? sweepstake.currentParticipants >= sweepstake.maxParticipants
    : false;

  // Update participants when data changes
  useEffect(() => {
    if (participantsData?.participants) {
      setParticipants(participantsData.participants);
    }
  }, [participantsData]);

  // Set up Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`sweepstake:${sweepstakeId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "participants",
          filter: `sweepstake_id=eq.${sweepstakeId}`,
        },
        (payload) => {
          console.log("Participant change:", payload);
          // Refetch participants data
          utils.sweepstakes.getParticipants.invalidate({ sweepstakeId });
          utils.sweepstakes.getSweepstake.invalidate({ sweepstakeId });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sweepstakeId, utils]);

  const handleJoin = async () => {
    try {
      await joinMutation.mutateAsync({ sweepstakeId });
      utils.sweepstakes.checkParticipation.invalidate({ sweepstakeId });
      utils.sweepstakes.getParticipants.invalidate({ sweepstakeId });
      utils.sweepstakes.getSweepstake.invalidate({ sweepstakeId });
    } catch (error) {
      console.error("Failed to join sweepstake:", error);
    }
  };

  if (loadingSweepstake || loadingParticipants) {
    return <LoadingState />;
  }

  if (sweepstakeError || !sweepstake) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Sweepstake Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {sweepstakeError?.message || "This sweepstake does not exist"}
          </p>
          <button
            onClick={() => router.push("/sweepstakes")}
            className="px-6 py-3 bg-gradient-to-r from-purple to-magenta text-white font-semibold rounded-lg hover:shadow-lg transition-all"
          >
            Browse Sweepstakes
          </button>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/sweepstakes"
          className="mb-6 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-2"
        >
          <span>←</span> Back to Browse
        </Link>

        {/* Sweepstake Header */}
        <div className="mb-8">
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            {sweepstake.name}
          </h2>

          {/* Tournament Info */}
          <div className="flex items-center gap-3 mb-4">
            {sweepstake.tournamentLogo && (
              <div className="w-12 h-12 flex-shrink-0 rounded overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <img
                  src={sweepstake.tournamentLogo}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Tournament</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {sweepstake.tournamentName || "Unknown"}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Join Code:</span>{" "}
              <code className="px-2 py-0.5 bg-purple/10 dark:bg-purple/20 text-purple dark:text-purple-400 rounded font-mono font-semibold">
                {sweepstake.joinCode}
              </code>
            </div>
            {sweepstake.creatorDisplayName && (
              <div>
                <span className="text-gray-500 dark:text-gray-400">Created by:</span>{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {sweepstake.creatorDisplayName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Participants Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Participants ({sweepstake.currentParticipants} / {sweepstake.maxParticipants})
            </h3>
            {isFull && (
              <span className="text-sm font-semibold text-red-600 dark:text-red-400">
                Full
              </span>
            )}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple to-magenta transition-all duration-500"
              style={{
                width: `${(sweepstake.currentParticipants / sweepstake.maxParticipants) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Join Button for non-participants */}
        {!isParticipant && (
          <div className="mb-8">
            <button
              onClick={handleJoin}
              disabled={isFull || joinMutation.isPending}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                isFull
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : joinMutation.isPending
                  ? "bg-gradient-to-r from-purple/70 to-magenta/70 text-white cursor-wait"
                  : "bg-gradient-to-r from-purple to-magenta text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
              }`}
            >
              {isFull ? "Sweepstake is Full" : joinMutation.isPending ? "Joining..." : "Join Sweepstake"}
            </button>
          </div>
        )}

        {/* Participants Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                participant.userId === userId
                  ? "border-purple bg-purple/5 dark:bg-purple/10"
                  : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
              }`}
            >
              <div className="flex flex-col items-center">
                {/* Avatar */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-full overflow-hidden bg-gradient-to-br from-purple to-magenta flex items-center justify-center">
                  {participant.avatarUrl ? (
                    <img
                      src={participant.avatarUrl}
                      alt={participant.displayName || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {(participant.displayName || "?")[0].toUpperCase()}
                    </span>
                  )}
                </div>
                {/* Name */}
                <div className="text-center">
                  <div className="font-semibold text-gray-900 dark:text-white text-sm truncate max-w-full">
                    {participant.displayName || "Anonymous"}
                  </div>
                  {participant.userId === userId && (
                    <div className="text-xs text-purple dark:text-purple-400 font-semibold mt-1">
                      You
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Placeholder slots for empty positions */}
          {Array.from({ length: sweepstake.maxParticipants - participants.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="p-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50"
            >
              <div className="flex flex-col items-center opacity-50">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mb-3 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                  <span className="text-2xl text-gray-400 dark:text-gray-600">?</span>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">Waiting...</div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
