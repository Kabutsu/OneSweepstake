"use client";

import { useState } from "react";
import DashboardLayout from "@/components/dashboard/dashboard-layout";
import Sidebar from "@/components/dashboard/sidebar";
import SweepstakeHeader from "@/components/dashboard/sweepstake-header";
import StatCard from "@/components/dashboard/stat-card";
import LiveMatchCard from "@/components/dashboard/live-match-card";
import ActionButtons from "@/components/dashboard/action-buttons";
import UpcomingState from "@/components/dashboard/upcoming-state";
import type { User, Sweepstake } from "@/types/dashboard";

// Mock data - will be replaced with real data later
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" } as User,
  sweepstakes: [
    {
      id: "1",
      name: "Office World Cup 2026",
      tournament: "FIFA World Cup 2026",
      rank: 2,
      teams: 3,
      participants: 12,
      status: "active" as const,
    },
    {
      id: "2",
      name: "Family Euro Pool",
      tournament: "UEFA Euro 2024",
      rank: 1,
      teams: 4,
      participants: 8,
      status: "active" as const,
    },
    {
      id: "3",
      name: "Friends League",
      tournament: "Copa América 2024",
      participants: 6,
      status: "upcoming" as const,
    },
  ] as Sweepstake[],
  liveMatch: {
    home: "Brazil",
    away: "Argentina",
    score: "2-1",
    minute: 67,
  },
};

export default function DashboardPage() {
  const [selectedSweepstake, setSelectedSweepstake] = useState(MOCK_DATA.sweepstakes[0]);

  // Placeholder action handlers
  const handleViewLeaderboard = () => console.log("View Leaderboard");
  const handleViewTeams = () => console.log("View Teams");
  const handleChat = () => console.log("Chat");
  const handleViewParticipants = () => console.log("View Participants");
  const handleNewSweepstake = () => console.log("New Sweepstake");

  return (
    <DashboardLayout
      mobileTitle={selectedSweepstake.name}
      sidebar={
        <Sidebar
          user={MOCK_DATA.user}
          sweepstakes={MOCK_DATA.sweepstakes}
          selectedSweepstake={selectedSweepstake}
          onSelectSweepstake={setSelectedSweepstake}
          isOpen={false} // Will be overridden by DashboardLayout
          onClose={() => {}} // Will be overridden by DashboardLayout
          onNewSweepstake={handleNewSweepstake}
        />
      }
    >
      {selectedSweepstake.status === "active" ? (
        <>
          <SweepstakeHeader
            name={selectedSweepstake.name}
            tournament={selectedSweepstake.tournament}
            status="active"
          />

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            <StatCard
              label="Your Rank"
              value={`#${selectedSweepstake.rank}`}
              gradient="purple-magenta"
              emphasized
            />
            <StatCard
              label="Teams Remaining"
              value={selectedSweepstake.teams || 0}
              gradient="orange-red"
            />
            <StatCard
              label="Participants"
              value={selectedSweepstake.participants}
              gradient="cyan-lime"
            />
          </div>

          {/* Live Match */}
          <LiveMatchCard
            homeTeam={MOCK_DATA.liveMatch.home}
            awayTeam={MOCK_DATA.liveMatch.away}
            score={MOCK_DATA.liveMatch.score}
            minute={MOCK_DATA.liveMatch.minute}
          />

          {/* Actions */}
          <ActionButtons
            onViewLeaderboard={handleViewLeaderboard}
            onViewTeams={handleViewTeams}
            onChat={handleChat}
          />
        </>
      ) : (
        <>
          <SweepstakeHeader
            name={selectedSweepstake.name}
            tournament={selectedSweepstake.tournament}
            status="upcoming"
          />
          <UpcomingState
            sweepstake={selectedSweepstake}
            onViewParticipants={handleViewParticipants}
          />
        </>
      )}
    </DashboardLayout>
  );
}
