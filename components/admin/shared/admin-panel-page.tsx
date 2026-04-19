"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TournamentTable } from "../tournament";
import { CreateTournamentModal } from "../tournament";
import BackLink from "./back-link";
import type { tournaments } from "@/db/schema";

type Tournament = typeof tournaments.$inferSelect;

interface AdminPanelPageProps {
  initialTournaments: Tournament[];
}

export default function AdminPanelPage({ initialTournaments }: AdminPanelPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleTournamentCreated = () => {
    setIsModalOpen(false);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <BackLink href="/" label="Back to Dashboard" />
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white mb-2 mt-4">
            Admin Panel
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage tournaments, seeding configurations, and system settings
          </p>
        </div>

        {/* Tournaments Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Tournaments
              </h2>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-purple hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
              >
                + Create Tournament
              </button>
            </div>
          </div>
          
          <TournamentTable tournaments={initialTournaments} />
        </div>
      </div>

      <CreateTournamentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTournamentCreated}
      />
    </div>
  );
}
