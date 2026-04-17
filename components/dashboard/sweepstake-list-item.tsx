"use client";

import type { Sweepstake } from "@/types/dashboard";

export interface SweepstakeListItemProps {
  sweepstake: Sweepstake;
  isSelected: boolean;
  onClick: () => void;
}

export default function SweepstakeListItem({
  sweepstake,
  isSelected,
  onClick,
}: SweepstakeListItemProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left p-4 rounded-lg transition-all relative
        ${
          isSelected
            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-l-4 border-transparent"
            : "hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300"
        }
      `}
      style={
        isSelected
          ? {
              borderLeftWidth: "0.5rem",
              borderColor: "rgb(168, 85, 247)",
            }
          : undefined
      }
    >
      <div className="flex items-start justify-between mb-2">
        <div className="font-semibold text-sm truncate pr-2">{sweepstake.name}</div>
        {sweepstake.status === "active" && (
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mt-1" />
        )}
      </div>
      <div
        className={`text-xs ${
          isSelected ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {sweepstake.tournament}
      </div>
    </button>
  );
}
