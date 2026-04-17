"use client";

import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// Mock data
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" },
  active: [
    { id: "1", name: "Office World Cup 2026", tournament: "FIFA World Cup 2026", rank: 2, teams: 3, participants: 12 },
    { id: "2", name: "Family Euro Pool", tournament: "UEFA Euro 2024", rank: 1, teams: 4, participants: 8 }
  ],
  upcoming: [
    { id: "3", name: "Friends League", tournament: "Copa América 2024", participants: 6, startDate: "June 20, 2024" }
  ],
  archived: [
    { id: "4", name: "Winter Cup 2023", tournament: "FIFA World Cup 2022", finalRank: 3, participants: 10 }
  ]
};

type Tab = 'active' | 'upcoming' | 'archived';

export default function Dashboard3() {
  const [activeTab, setActiveTab] = useState<Tab>('active');
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-gray-950 dark:via-purple-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-300/30 dark:bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-300/30 dark:bg-pink-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Glass Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/30 dark:bg-gray-900/30 border-b border-white/20 dark:border-white/10 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-500 backdrop-blur-sm flex items-center justify-center shadow-lg">
                <span className="text-white font-display text-lg font-bold">OS</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                OneSweepstake
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl backdrop-blur-md bg-white/40 dark:bg-gray-800/40 hover:bg-white/60 dark:hover:bg-gray-800/60 transition-all border border-white/20 shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {MOCK_DATA.user.avatar}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-gray-900 dark:text-white">
                    {MOCK_DATA.user.name}
                  </span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-2xl border border-white/20 py-2">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Glass Container */}
        <div className="backdrop-blur-2xl bg-white/40 dark:bg-gray-900/40 rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-white/20 dark:border-white/10 bg-white/20 dark:bg-gray-900/20">
            <div className="flex overflow-x-auto scrollbar-hide">
              <button
                onClick={() => setActiveTab('active')}
                className={`flex-1 min-w-[120px] px-6 py-4 font-display font-bold text-sm sm:text-base transition-all relative ${
                  activeTab === 'active'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Active
                {activeTab === 'active' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`flex-1 min-w-[120px] px-6 py-4 font-display font-bold text-sm sm:text-base transition-all relative ${
                  activeTab === 'upcoming'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Upcoming
                {activeTab === 'upcoming' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('archived')}
                className={`flex-1 min-w-[120px] px-6 py-4 font-display font-bold text-sm sm:text-base transition-all relative ${
                  activeTab === 'archived'
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                Archived
                {activeTab === 'archived' && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-full" />
                )}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6 sm:p-8 min-h-[500px]">
            {/* Active Tab */}
            {activeTab === 'active' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                    Your Active Sweepstakes
                  </h2>
                  <span className="px-4 py-2 rounded-full backdrop-blur-md bg-purple-500/20 dark:bg-purple-400/20 text-purple-700 dark:text-purple-300 font-semibold text-sm border border-purple-500/30">
                    {MOCK_DATA.active.length} Active
                  </span>
                </div>

                <div className="grid gap-4">
                  {MOCK_DATA.active.map((sweep) => (
                    <div
                      key={sweep.id}
                      className="group backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all cursor-pointer border border-white/30 dark:border-white/10 hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                              Live
                            </span>
                          </div>
                          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                            {sweep.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sweep.tournament}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="backdrop-blur-md bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl px-4 py-3 text-center border border-purple-500/30">
                            <div className="text-2xl font-display font-bold text-purple-600 dark:text-purple-400">
                              #{sweep.rank}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Rank</div>
                          </div>
                          <div className="backdrop-blur-md bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl px-4 py-3 text-center border border-indigo-500/30">
                            <div className="text-2xl font-display font-bold text-indigo-600 dark:text-indigo-400">
                              {sweep.teams}
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">Teams</div>
                          </div>
                          <button className="hidden sm:block px-6 py-3 rounded-xl backdrop-blur-md bg-purple-500/80 hover:bg-purple-600/80 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105">
                            View
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <button className="group backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-2xl p-6 border border-purple-500/30 hover:border-purple-500/50 transition-all hover:shadow-xl hover:scale-[1.02]">
                    <div className="text-3xl mb-3">🏆</div>
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1">
                      Create New Sweepstake
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Start a new tournament pool
                    </p>
                  </button>

                  <button className="group backdrop-blur-xl bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 hover:from-indigo-500/30 hover:to-cyan-500/30 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-500/50 transition-all hover:shadow-xl hover:scale-[1.02]">
                    <div className="text-3xl mb-3">🎯</div>
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1">
                      Join with Code
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Enter an invite code
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Tab */}
            {activeTab === 'upcoming' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                    Upcoming Sweepstakes
                  </h2>
                  <span className="px-4 py-2 rounded-full backdrop-blur-md bg-indigo-500/20 dark:bg-indigo-400/20 text-indigo-700 dark:text-indigo-300 font-semibold text-sm border border-indigo-500/30">
                    {MOCK_DATA.upcoming.length} Upcoming
                  </span>
                </div>

                <div className="grid gap-4">
                  {MOCK_DATA.upcoming.map((sweep) => (
                    <div
                      key={sweep.id}
                      className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 rounded-2xl p-6 border border-white/30 dark:border-white/10 hover:bg-white/70 dark:hover:bg-gray-800/70 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="inline-flex items-center px-3 py-1 rounded-full backdrop-blur-md bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
                            Starts {sweep.startDate}
                          </div>
                          <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                            {sweep.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {sweep.tournament}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {sweep.participants} participants joined
                          </p>
                        </div>
                        <button className="px-6 py-3 rounded-xl backdrop-blur-md bg-indigo-500/80 hover:bg-indigo-600/80 text-white font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105">
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archived Tab */}
            {activeTab === 'archived' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white">
                    Archived Sweepstakes
                  </h2>
                  <span className="px-4 py-2 rounded-full backdrop-blur-md bg-gray-500/20 text-gray-700 dark:text-gray-300 font-semibold text-sm border border-gray-500/30">
                    {MOCK_DATA.archived.length} Archived
                  </span>
                </div>

                <div className="grid gap-4">
                  {MOCK_DATA.archived.map((sweep) => (
                    <div
                      key={sweep.id}
                      className="backdrop-blur-xl bg-white/30 dark:bg-gray-800/30 rounded-2xl p-6 border border-white/20 dark:border-white/10 opacity-75 hover:opacity-100 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="inline-flex items-center px-3 py-1 rounded-full backdrop-blur-md bg-gray-500/20 text-gray-600 dark:text-gray-400 text-xs font-semibold mb-3 border border-gray-500/30">
                            Completed
                          </div>
                          <h3 className="text-xl font-display font-bold text-gray-700 dark:text-gray-300 mb-1">
                            {sweep.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {sweep.tournament}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Final rank: #{sweep.finalRank} • {sweep.participants} participants
                          </p>
                        </div>
                        <button className="px-6 py-3 rounded-xl backdrop-blur-md bg-gray-500/60 hover:bg-gray-600/60 text-white font-semibold transition-all">
                          View History
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="backdrop-blur-2xl bg-white/50 dark:bg-gray-900/50 rounded-2xl shadow-2xl border border-white/20 px-4 py-3">
          <div className="flex items-center justify-around">
            <button className="flex flex-col items-center gap-1 text-purple-600 dark:text-purple-400">
              <span className="text-xl">🏠</span>
              <span className="text-xs font-semibold">Home</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <span className="text-xl">🏆</span>
              <span className="text-xs font-semibold">Create</span>
            </button>
            <button className="flex flex-col items-center gap-1 text-gray-400">
              <span className="text-xl">🎯</span>
              <span className="text-xs font-semibold">Join</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
