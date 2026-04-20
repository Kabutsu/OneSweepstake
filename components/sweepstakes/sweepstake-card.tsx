"use client";

import type { PublicSweepstake } from "@/types/sweepstakes";

export interface SweepstakeCardProps {
  sweepstake: PublicSweepstake;
  onJoin: (sweepstakeId: string) => void;
  isJoining?: boolean;
}

export default function SweepstakeCard({
  sweepstake,
  onJoin,
  isJoining = false
}: SweepstakeCardProps) {
  const isFull = sweepstake.currentParticipants >= sweepstake.maxParticipants;
  const fillPercentage = (sweepstake.currentParticipants / sweepstake.maxParticipants) * 100;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-purple/30 dark:border-purple/20 hover:shadow-lg transition-all hover:border-purple/50">
      {/* Sweepstake Name */}
      <div className="mb-4">
        <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {sweepstake.name}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Code:</span>
          <code className="px-2 py-0.5 bg-purple/10 dark:bg-purple/20 text-purple dark:text-purple-400 rounded font-mono font-semibold">
            {sweepstake.joinCode}
          </code>
        </div>
      </div>

      {/* Tournament Info */}
      <div className="mb-4 p-3 bg-gradient-to-r from-purple/5 to-magenta/5 dark:from-purple/10 dark:to-magenta/10 rounded-lg border border-purple/10 dark:border-purple/20">
        <div className="flex items-center gap-3">
          {sweepstake.tournamentLogo && (
            <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-white dark:bg-gray-800">
              <img
                src={sweepstake.tournamentLogo}
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Tournament
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {sweepstake.tournamentName || "Unknown Tournament"}
            </div>
          </div>
        </div>
      </div>

      {/* Creator Info */}
      {sweepstake.creatorDisplayName && (
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Created by <span className="font-semibold text-gray-900 dark:text-white">{sweepstake.creatorDisplayName}</span>
        </div>
      )}

      {/* Participants Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Participants</span>
          <span className="font-semibold text-gray-900 dark:text-white">
            {sweepstake.currentParticipants} / {sweepstake.maxParticipants}
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple to-magenta transition-all duration-500 ease-out"
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      {/* Join Button */}
      <button
        onClick={() => !isFull && !isJoining && onJoin(sweepstake.id)}
        disabled={isFull || isJoining}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isFull
            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : isJoining
            ? "bg-gradient-to-r from-purple/70 to-magenta/70 text-white cursor-wait"
            : "bg-gradient-to-r from-purple to-magenta text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isFull ? "Full" : isJoining ? "Joining..." : "Join Sweepstake"}
      </button>
    </div>
  );
}
