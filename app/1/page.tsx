"use client";

import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// Mock data
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" },
  featuredSweepstake: {
    id: "1",
    name: "Office World Cup 2026",
    tournament: "FIFA World Cup 2026",
    participants: 12,
    yourRank: 2,
    teamsRemaining: 3,
    liveMatch: { home: "Brazil", away: "Argentina", score: "2-1", minute: 67 }
  },
  sweepstakes: [
    { id: "2", name: "Family Euro Pool", tournament: "UEFA Euro 2024", rank: 1, teams: 4 },
    { id: "3", name: "Friends League", tournament: "Copa América 2024", rank: 3, teams: 2 }
  ]
};

export default function Dashboard1() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-gray-900 dark:via-purple-950 dark:to-fuchsia-950">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-b border-purple-200 dark:border-purple-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple to-magenta flex items-center justify-center">
                <span className="text-white font-display text-xl">OS</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                OneSweepstake
              </h1>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                    {MOCK_DATA.user.avatar}
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {MOCK_DATA.user.name}
                  </span>
                </button>
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                  {MOCK_DATA.user.avatar}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Featured Sweepstake */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple via-magenta to-pink-600 p-8 sm:p-10 text-white shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              {/* Live Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm mb-4">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-sm font-semibold">LIVE NOW</span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-3">
                {MOCK_DATA.featuredSweepstake.name}
              </h2>
              <p className="text-white/90 text-lg mb-6">
                {MOCK_DATA.featuredSweepstake.tournament}
              </p>

              {/* Live Match Score */}
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 sm:p-6 mb-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div className="flex-1 text-center">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {MOCK_DATA.featuredSweepstake.liveMatch.home}
                    </div>
                    <div className="text-3xl sm:text-4xl font-display font-bold">
                      {MOCK_DATA.featuredSweepstake.liveMatch.score.split('-')[0]}
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 text-center">
                    <div className="text-sm opacity-90 mb-1">MIN</div>
                    <div className="text-2xl font-bold">{MOCK_DATA.featuredSweepstake.liveMatch.minute}'</div>
                  </div>
                  <div className="flex-1 text-center">
                    <div className="text-2xl sm:text-3xl font-bold mb-1">
                      {MOCK_DATA.featuredSweepstake.liveMatch.away}
                    </div>
                    <div className="text-3xl sm:text-4xl font-display font-bold">
                      {MOCK_DATA.featuredSweepstake.liveMatch.score.split('-')[1]}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl sm:text-3xl font-display font-bold">
                    #{MOCK_DATA.featuredSweepstake.yourRank}
                  </div>
                  <div className="text-sm opacity-90 mt-1">Your Rank</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl sm:text-3xl font-display font-bold">
                    {MOCK_DATA.featuredSweepstake.teamsRemaining}
                  </div>
                  <div className="text-sm opacity-90 mt-1">Teams Left</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 text-center border border-white/20">
                  <div className="text-2xl sm:text-3xl font-display font-bold">
                    {MOCK_DATA.featuredSweepstake.participants}
                  </div>
                  <div className="text-sm opacity-90 mt-1">Players</div>
                </div>
              </div>

              {/* CTA */}
              <button className="mt-6 w-full sm:w-auto px-8 py-3 bg-white text-purple font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 active:scale-95">
                View Sweepstake Details
              </button>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="flex-1 group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-all border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700">
              <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-magenta/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-3xl mb-2">🏆</div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                  Create Sweepstake
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a new tournament pool
                </p>
              </div>
            </button>

            <button className="flex-1 group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 p-6 shadow-lg hover:shadow-xl transition-all border border-cyan-100 dark:border-cyan-900 hover:border-cyan-300 dark:hover:border-cyan-700">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-lime/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="text-3xl mb-2">🎯</div>
                <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white mb-1">
                  Join Sweepstake
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Enter with an invite code
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* Other Sweepstakes */}
        <section>
          <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4">
            Your Other Sweepstakes
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {MOCK_DATA.sweepstakes.map((sweep) => (
              <div
                key={sweep.id}
                className="group bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1">
                      {sweep.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sweep.tournament}
                    </p>
                  </div>
                  <div className="text-2xl">⚽</div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-purple dark:text-purple-400">
                      Rank #{sweep.rank}
                    </span>
                  </div>
                  <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                  <div className="text-gray-600 dark:text-gray-400">
                    {sweep.teams} teams left
                  </div>
                </div>
                <button className="mt-4 text-sm font-semibold text-purple dark:text-purple-400 group-hover:underline">
                  View Details →
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-4 py-3">
          <button className="flex flex-col items-center gap-1 text-purple dark:text-purple-400">
            <div className="text-xl">🏠</div>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <div className="text-xl">🏆</div>
            <span className="text-xs font-medium">Create</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <div className="text-xl">🎯</div>
            <span className="text-xs font-medium">Join</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
