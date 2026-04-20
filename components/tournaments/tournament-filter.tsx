"use client";

import type { TournamentStatus } from "@/types/tournaments";

export interface TournamentFilterProps {
  selectedFilter: "all" | TournamentStatus;
  onFilterChange: (filter: "all" | TournamentStatus) => void;
}

const filters: Array<{ value: "all" | TournamentStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

export default function TournamentFilter({ selectedFilter, onFilterChange }: TournamentFilterProps) {
  return (
    <>
      {/* Desktop: Button Group */}
      <div className="hidden md:flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              selectedFilter === filter.value
                ? "bg-gradient-to-r from-purple to-magenta text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Mobile: Dropdown */}
      <div className="md:hidden">
        <select
          value={selectedFilter}
          onChange={(e) => onFilterChange(e.target.value as "all" | TournamentStatus)}
          className="w-full px-4 py-3 rounded-lg font-semibold bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-purple focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent"
        >
          {filters.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
