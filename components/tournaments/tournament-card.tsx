"use client";

import type { TournamentWithStatus } from "@/types/tournaments";
import { format } from "date-fns";

export interface TournamentCardProps {
  tournament: TournamentWithStatus;
  onCreateSweepstake: (tournamentId: string) => void;
}

const statusConfig = {
  upcoming: {
    label: "Upcoming",
    borderColor: "rgb(6, 182, 212)", // cyan
    gradient: "from-cyan to-lime",
    textColor: "text-cyan dark:text-cyan",
    enabled: true,
  },
  active: {
    label: "Active",
    borderColor: "rgb(249, 115, 22)", // orange
    gradient: "from-orange-500 to-red-600",
    textColor: "text-orange-500 dark:text-orange-400",
    enabled: true,
  },
  completed: {
    label: "Completed",
    borderColor: "rgb(107, 114, 128)", // gray
    gradient: "from-gray-400 to-gray-600",
    textColor: "text-gray-500 dark:text-gray-400",
    enabled: false,
  },
};

export default function TournamentCard({ tournament, onCreateSweepstake }: TournamentCardProps) {
  const config = statusConfig[tournament.status];
  const isDisabled = !config.enabled;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 transition-all ${
        isDisabled ? "opacity-50" : "hover:shadow-lg"
      }`}
      style={{
        borderColor: config.borderColor,
      }}
    >
      {/* Tournament Logo and Name */}
      <div className="flex items-start gap-4 mb-4">
        {tournament.logo && (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={tournament.logo}
              alt={`${tournament.name} logo`}
              className="w-full h-full object-contain"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
            {tournament.name}
          </h3>
          <div
            className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${config.textColor} bg-gradient-to-r ${config.gradient} bg-clip-text`}
          >
            {config.label}
          </div>
        </div>
      </div>

      {/* Tournament Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Start Date
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(new Date(tournament.startDate), "MMM d, yyyy")}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            End Date
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {format(new Date(tournament.endDate), "MMM d, yyyy")}
          </div>
        </div>
        <div className="col-span-2">
          <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
            Total Teams
          </div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            {tournament.teamCount} teams
          </div>
        </div>
      </div>

      {/* Create Sweepstake Button */}
      <button
        onClick={() => !isDisabled && onCreateSweepstake(tournament.id)}
        disabled={isDisabled}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
          isDisabled
            ? "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple to-magenta text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isDisabled ? "Tournament Ended" : "Create Sweepstake"}
      </button>
    </div>
  );
}
