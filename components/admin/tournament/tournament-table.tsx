"use client";

import Link from "next/link";
import type { tournaments } from "@/db/schema";

type Tournament = typeof tournaments.$inferSelect;

interface TournamentTableProps {
  tournaments: Tournament[];
}

export default function TournamentTable({ tournaments }: TournamentTableProps) {
  if (tournaments.length === 0) {
    return (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No tournaments yet. Create your first tournament to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Tournament
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Teams
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
          {tournaments.map((tournament) => (
            <tr
              key={tournament.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  {tournament.logo && (
                    <img
                      src={tournament.logo}
                      alt={tournament.name}
                      className="w-8 h-8 object-contain"
                    />
                  )}
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {tournament.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {tournament.slug}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {new Date(tournament.startDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                {tournament.teamCount}
              </td>
              <td className="px-6 py-4">
                {tournament.isActive ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-400">
                    Inactive
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                <Link
                  href={`/admin/tournaments/${tournament.id}/seeding`}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-purple hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                >
                  Configure Seeding →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
