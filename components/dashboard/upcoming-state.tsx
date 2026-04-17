"use client";

import type { Sweepstake } from "@/types/dashboard";

export interface UpcomingStateProps {
  sweepstake: Sweepstake;
  onViewParticipants: () => void;
}

export default function UpcomingState({ sweepstake, onViewParticipants }: UpcomingStateProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-12 border-2 border-blue-200 dark:border-blue-800 text-center">
      <div className="text-6xl mb-6">⏳</div>
      <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
        Tournament Starts Soon
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {sweepstake.participants} participants have joined. Waiting for the tournament to begin.
      </p>
      <button
        onClick={onViewParticipants}
        className="py-3 px-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95"
      >
        View Participants
      </button>
    </div>
  );
}
