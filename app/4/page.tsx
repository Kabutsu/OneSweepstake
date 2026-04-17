"use client";

import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// Mock data
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" },
  sweepstakes: [
    { id: "1", name: "Office World Cup 2026", tournament: "FIFA World Cup 2026", rank: 2, teams: 3, participants: 12, status: "active" },
    { id: "2", name: "Family Euro Pool", tournament: "UEFA Euro 2024", rank: 1, teams: 4, participants: 8, status: "active" },
    { id: "3", name: "Friends League", tournament: "Copa América 2024", participants: 6, status: "upcoming" }
  ]
};

export default function Dashboard4() {
  const [selectedSweepstake, setSelectedSweepstake] = useState(MOCK_DATA.sweepstakes[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 dark:from-gray-950 dark:via-purple-950/30 dark:to-indigo-950/30 relative">
      {/* Radial glow background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-200/30 dark:bg-purple-600/10 rounded-full blur-3xl -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pink-200/30 dark:bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-80 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-r border-gray-200 dark:border-gray-800
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple to-magenta flex items-center justify-center shadow-md">
                  <span className="text-white font-display text-lg font-bold">
                    OS
                  </span>
                </div>
                <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white">
                  OneSweepstake
                </h1>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {MOCK_DATA.user.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {MOCK_DATA.user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {MOCK_DATA.sweepstakes.length} sweepstakes
                </div>
              </div>
            </div>
          </div>

          {/* Sweepstakes List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 px-2">
              Your Sweepstakes
            </div>
            {MOCK_DATA.sweepstakes.map((sweep) => (
              <button
                key={sweep.id}
                onClick={() => {
                  setSelectedSweepstake(sweep);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full text-left p-4 rounded-lg transition-all relative
                  ${selectedSweepstake.id === sweep.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-l-4 border-transparent'
                    : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 text-gray-700 dark:text-gray-300'
                  }
                `}
                style={selectedSweepstake.id === sweep.id ? {
                  borderLeftWidth: '4px',
                  borderImage: 'linear-gradient(to bottom, rgb(168, 85, 247), rgb(236, 72, 153)) 1'
                } : undefined}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-semibold text-sm truncate pr-2">
                    {sweep.name}
                  </div>
                  {sweep.status === 'active' && (
                    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mt-1" />
                  )}
                </div>
                <div className={`text-xs ${selectedSweepstake.id === sweep.id ? 'text-gray-300 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                  {sweep.tournament}
                </div>
              </button>
            ))}

            <button className="w-full p-4 mt-4 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-purple dark:hover:border-purple hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-gray-600 dark:text-gray-400 hover:text-purple dark:hover:text-purple-400">
              <div className="text-2xl mb-1">+</div>
              <div className="text-sm font-semibold">New Sweepstake</div>
            </button>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        {/* Top Bar (Mobile) */}
        <div className="lg:hidden sticky top-0 z-20 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg font-display font-bold text-gray-900 dark:text-white truncate">
              {selectedSweepstake.name}
            </h2>
            <ThemeToggle />
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-4xl mx-auto p-6 lg:p-12">
          {selectedSweepstake.status === 'active' ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-500" />
                  <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 uppercase tracking-wide">
                    Active
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-3">
                  {selectedSweepstake.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {selectedSweepstake.tournament}
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid sm:grid-cols-3 gap-6 mb-12">
                {/* Your Rank - Emphasized */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-4 border-transparent bg-clip-padding relative shadow-lg"
                  style={{
                    borderImage: 'linear-gradient(135deg, rgb(168, 85, 247), rgb(236, 72, 153)) 1',
                    boxShadow: '0 0 30px rgba(168, 85, 247, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta uppercase tracking-wide mb-2">
                    Your Rank
                  </div>
                  <div className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta">
                    #{selectedSweepstake.rank}
                  </div>
                </div>

                {/* Teams Remaining */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-transparent bg-clip-padding"
                  style={{
                    borderImage: 'linear-gradient(135deg, rgb(249, 115, 22), rgb(220, 38, 38)) 1'
                  }}
                >
                  <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600 uppercase tracking-wide mb-2">
                    Teams Remaining
                  </div>
                  <div className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
                    {selectedSweepstake.teams}
                  </div>
                </div>

                {/* Participants */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border-2 border-transparent bg-clip-padding"
                  style={{
                    borderImage: 'linear-gradient(135deg, rgb(6, 182, 212), rgb(132, 204, 22)) 1'
                  }}
                >
                  <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-lime uppercase tracking-wide mb-2">
                    Participants
                  </div>
                  <div className="text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan to-lime">
                    {selectedSweepstake.participants}
                  </div>
                </div>
              </div>

              {/* Live Match - Hero Treatment */}
              <div className="relative overflow-hidden bg-gradient-to-br from-purple via-magenta to-pink-600 rounded-2xl p-8 mb-8 text-white shadow-2xl">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative z-10">
                  {/* Live Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                    <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                    <span className="text-sm font-semibold uppercase tracking-wide">Live Match</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold mb-2">
                        Brazil
                      </div>
                      <div className="text-5xl font-display font-bold">
                        2
                      </div>
                    </div>

                    <div className="px-8 text-center">
                      <div className="text-sm opacity-90 mb-1">
                        67'
                      </div>
                      <div className="w-px h-12 bg-white/30" />
                    </div>

                    <div className="flex-1 text-center">
                      <div className="text-2xl font-bold mb-2">
                        Argentina
                      </div>
                      <div className="text-5xl font-display font-bold">
                        1
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 py-4 px-6 bg-gradient-to-r from-purple to-magenta text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95">
                  View Leaderboard
                </button>
                <button className="flex-1 py-4 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple dark:hover:border-purple transition-all">
                  View Teams
                </button>
                <button className="flex-1 py-4 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-cyan dark:hover:border-cyan transition-all">
                  Chat
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Upcoming State */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500 uppercase tracking-wide">
                    Upcoming
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-3">
                  {selectedSweepstake.name}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {selectedSweepstake.tournament}
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-2xl p-12 border-2 border-blue-200 dark:border-blue-800 text-center">
                <div className="text-6xl mb-6">⏳</div>
                <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-3">
                  Tournament Starts Soon
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {selectedSweepstake.participants} participants have joined. Waiting for the tournament to begin.
                </p>
                <button className="py-3 px-8 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95">
                  View Participants
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
