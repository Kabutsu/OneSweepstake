"use client";

import { useState } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// Mock data
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" },
  sweepstakes: [
    { id: "1", name: "Office World Cup 2026", tournament: "FIFA World Cup 2026", rank: 2, teams: 3 },
    { id: "2", name: "Family Euro Pool", tournament: "UEFA Euro 2024", rank: 1, teams: 4 },
    { id: "3", name: "Friends League", tournament: "Copa América 2024", rank: 3, teams: 2 }
  ],
  feed: [
    { type: "live", icon: "⚡", title: "Brazil 2-1 Argentina", subtitle: "Office World Cup 2026 • 67' LIVE", time: "Now", color: "from-red-500 to-orange-500" },
    { type: "rank", icon: "🏆", title: "You moved up to #2!", subtitle: "Office World Cup 2026", time: "2m ago", color: "from-amber-500 to-yellow-400" },
    { type: "elimination", icon: "🚫", title: "Germany Eliminated", subtitle: "Lost to France 1-2", time: "15m ago", color: "from-gray-600 to-gray-500" },
    { type: "message", icon: "💬", title: "New message from Sarah", subtitle: "\"Great match! We're catching up!\"", time: "23m ago", color: "from-blue-500 to-cyan-500" },
    { type: "score", icon: "⚽", title: "France 2-1 Germany", subtitle: "Final • Family Euro Pool", time: "1h ago", color: "from-green-500 to-emerald-500" },
    { type: "team", icon: "🎯", title: "3 teams remaining", subtitle: "You're in 2nd place", time: "2h ago", color: "from-purple-500 to-pink-500" }
  ]
};

export default function Dashboard5() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-red-50 dark:from-gray-950 dark:via-orange-950 dark:to-red-950">
      {/* Diagonal stripe background */}
      <div className="fixed inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 20px,
              currentColor 20px,
              currentColor 40px
            )`
          }}
        />
      </div>

      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-accent dark:from-purple dark:to-magenta shadow-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo with angle */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 transform -skew-x-12 flex items-center justify-center shadow-lg">
                  <span className="font-display text-2xl font-bold text-primary dark:text-purple skew-x-12">
                    OS
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-gold rounded-full animate-pulse" />
              </div>
              <h1 className="text-2xl font-display font-bold text-white uppercase tracking-wider">
                OneSweepstake
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-accent-gold rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {MOCK_DATA.user.avatar}
                  </div>
                  <span className="hidden sm:inline text-white font-semibold">
                    {MOCK_DATA.user.name}
                  </span>
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2">
                    <LogoutButton />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="bg-black/10 dark:bg-white/10 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-6 py-3 overflow-x-auto scrollbar-hide">
              <div className="flex items-center gap-2 text-white">
                <span className="font-display font-bold text-2xl">3</span>
                <span className="text-sm opacity-90">Active</span>
              </div>
              <div className="w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2 text-white">
                <span className="font-display font-bold text-2xl">#2</span>
                <span className="text-sm opacity-90">Best Rank</span>
              </div>
              <div className="w-px h-6 bg-white/30" />
              <div className="flex items-center gap-2 text-white">
                <span className="font-display font-bold text-2xl">9</span>
                <span className="text-sm opacity-90">Teams Left</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Feed */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Quick Actions - Floating Cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          <button className="group relative overflow-hidden bg-gradient-to-br from-primary to-accent dark:from-purple dark:to-magenta p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                🏆
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-1">
                CREATE SWEEPSTAKE
              </h3>
              <p className="text-white/80 text-sm">
                Start a new tournament pool
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-accent-gold transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>

          <button className="group relative overflow-hidden bg-gradient-to-br from-cyan to-lime dark:from-cyan dark:to-lime p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-[1.02] active:scale-[0.98]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                🎯
              </div>
              <h3 className="text-xl font-display font-bold text-white mb-1">
                JOIN WITH CODE
              </h3>
              <p className="text-white/80 text-sm">
                Enter an invite code
              </p>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform" />
          </button>
        </div>

        {/* Your Sweepstakes - Horizontal Scroll */}
        <section className="mb-8">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Your Sweepstakes
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {MOCK_DATA.sweepstakes.map((sweep) => (
              <div
                key={sweep.id}
                className="flex-none w-72 snap-start group"
              >
                <div className="relative bg-white dark:bg-gray-900 rounded-xl p-5 shadow-lg hover:shadow-2xl transition-all cursor-pointer border-l-4 border-primary dark:border-purple overflow-hidden">
                  {/* Diagonal accent */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-accent/10 dark:from-purple/10 dark:to-magenta/10 transform rotate-45 translate-x-12 -translate-y-12" />
                  
                  <div className="relative z-10">
                    <h3 className="text-lg font-display font-bold text-gray-900 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-purple transition-colors">
                      {sweep.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {sweep.tournament}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-lg p-3 text-center border border-amber-200 dark:border-orange-800">
                        <div className="text-2xl font-display font-bold text-amber-700 dark:text-amber-400">
                          #{sweep.rank}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-500 font-semibold">
                          RANK
                        </div>
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg p-3 text-center border border-red-200 dark:border-red-800">
                        <div className="text-2xl font-display font-bold text-red-700 dark:text-red-400">
                          {sweep.teams}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-500 font-semibold">
                          TEAMS
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Activity Feed */}
        <section>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
            Live Activity
          </h2>
          <div className="space-y-3">
            {MOCK_DATA.feed.map((item, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-xl p-5 shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                {/* Colored left accent */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${item.color}`} />
                
                <div className="flex items-start gap-4 pl-3">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-2xl shadow-lg transform group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    {item.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-gray-900 dark:text-white mb-1 group-hover:text-primary dark:group-hover:text-purple transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 text-sm font-semibold text-gray-500 dark:text-gray-400">
                    {item.time}
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-primary to-accent dark:from-purple dark:to-magenta rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center text-white text-3xl font-bold z-50 group">
        <span className="transform group-hover:rotate-90 transition-transform">+</span>
        <div className="absolute inset-0 rounded-full bg-accent-gold animate-ping opacity-25" />
      </button>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t-2 border-primary dark:border-purple shadow-2xl">
        <div className="flex items-center justify-around px-4 py-3 safe-area-inset-bottom">
          <button className="flex flex-col items-center gap-1 text-primary dark:text-purple">
            <span className="text-2xl">⚡</span>
            <span className="text-xs font-display font-bold">Feed</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">🏆</span>
            <span className="text-xs font-display font-bold">Create</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-gray-400">
            <span className="text-2xl">👥</span>
            <span className="text-xs font-display font-bold">Pools</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
