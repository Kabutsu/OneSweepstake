"use client";

import { useRef } from "react";
import ThemeToggle from "@/components/theme-toggle";
import LogoutButton from "@/components/logout-button";

// Mock data
const MOCK_DATA = {
  user: { name: "Alex Morgan", avatar: "AM" },
  activeSweepstakes: [
    { id: "1", name: "Office World Cup 2026", tournament: "FIFA World Cup 2026", rank: 2, teams: 3, live: true },
    { id: "2", name: "Family Euro Pool", tournament: "UEFA Euro 2024", rank: 1, teams: 4, live: false },
    { id: "3", name: "Friends League", tournament: "Copa América 2024", rank: 3, teams: 2, live: false }
  ],
  tournaments: [
    { id: "1", name: "FIFA World Cup 2026", teams: 48, status: "Active" },
    { id: "2", name: "UEFA Euro 2024", teams: 24, status: "Active" },
    { id: "3", name: "Copa América 2024", teams: 16, status: "Upcoming" }
  ],
  recentActivity: [
    { type: "elimination", text: "Brazil eliminated Argentina", time: "2 min ago" },
    { type: "message", text: "New message in Office World Cup", time: "5 min ago" },
    { type: "score", text: "France 2-1 Germany (Final)", time: "1 hour ago" }
  ]
};

export default function Dashboard2() {
  const activeScrollRef = useRef<HTMLDivElement>(null);
  const tournamentsScrollRef = useRef<HTMLDivElement>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = 300;
      ref.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-amber-50 dark:bg-black">
      {/* Brutalist Header */}
      <header className="border-b-4 border-black dark:border-white bg-primary dark:bg-purple">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-black dark:bg-white border-4 border-black dark:border-white flex items-center justify-center rotate-3">
                <span className="text-white dark:text-black font-display text-2xl font-bold -rotate-3">
                  OS
                </span>
              </div>
              <h1 className="text-3xl font-display font-bold text-black dark:text-white uppercase tracking-tight">
                OneSweepstake
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white">
                <div className="w-8 h-8 bg-accent-gold flex items-center justify-center font-display font-bold text-black">
                  {MOCK_DATA.user.avatar}
                </div>
                <span className="font-display text-lg font-bold">{MOCK_DATA.user.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-0 py-8 space-y-12">
        {/* Active Sweepstakes Section */}
        <section>
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-black dark:text-white uppercase">
                Active Sweepstakes
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(activeScrollRef, 'left')}
                  className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white hover:bg-accent dark:hover:bg-magenta transition-colors flex items-center justify-center font-display text-2xl font-bold"
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button
                  onClick={() => scroll(activeScrollRef, 'right')}
                  className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white hover:bg-accent dark:hover:bg-magenta transition-colors flex items-center justify-center font-display text-2xl font-bold"
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div
            ref={activeScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {MOCK_DATA.activeSweepstakes.map((sweep) => (
              <div
                key={sweep.id}
                className="flex-none w-[320px] sm:w-[380px] snap-start"
              >
                <div className="bg-white dark:bg-gray-900 border-4 border-black dark:border-white p-6 h-full hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer">
                  {sweep.live && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent mb-4 border-2 border-black">
                      <div className="w-2 h-2 bg-black animate-pulse" />
                      <span className="font-display font-bold text-black text-sm">LIVE</span>
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-display font-bold text-black dark:text-white mb-2 uppercase">
                    {sweep.name}
                  </h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-6">
                    {sweep.tournament}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-amber-100 dark:bg-purple-900 border-2 border-black dark:border-white p-4">
                      <div className="text-3xl font-display font-bold text-black dark:text-white">
                        #{sweep.rank}
                      </div>
                      <div className="text-sm font-bold text-black dark:text-white uppercase">
                        Your Rank
                      </div>
                    </div>
                    <div className="bg-red-100 dark:bg-magenta border-2 border-black dark:border-white p-4">
                      <div className="text-3xl font-display font-bold text-black dark:text-white">
                        {sweep.teams}
                      </div>
                      <div className="text-sm font-bold text-black dark:text-white uppercase">
                        Teams Left
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white font-display font-bold text-lg uppercase hover:bg-accent-gold hover:text-black transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            ))}

            {/* Add New Card */}
            <div className="flex-none w-[320px] sm:w-[380px] snap-start">
              <div className="bg-amber-200 dark:bg-purple-900 border-4 border-black dark:border-white border-dashed p-6 h-full flex flex-col items-center justify-center cursor-pointer hover:bg-accent-gold dark:hover:bg-magenta transition-colors">
                <div className="text-6xl mb-4">+</div>
                <h3 className="text-2xl font-display font-bold text-black dark:text-white mb-2 uppercase text-center">
                  Join New Sweepstake
                </h3>
                <p className="text-center font-semibold text-black dark:text-white">
                  Enter invite code
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tournaments Section */}
        <section className="bg-black dark:bg-white py-12">
          <div className="px-4 sm:px-6 lg:px-8 mb-6">
            <div className="flex items-center justify-between">
              <h2 className="text-4xl sm:text-5xl font-display font-bold text-white dark:text-black uppercase">
                Tournaments
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => scroll(tournamentsScrollRef, 'left')}
                  className="w-12 h-12 bg-white dark:bg-black text-black dark:text-white border-4 border-white dark:border-black hover:bg-accent-gold transition-colors flex items-center justify-center font-display text-2xl font-bold"
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button
                  onClick={() => scroll(tournamentsScrollRef, 'right')}
                  className="w-12 h-12 bg-white dark:bg-black text-black dark:text-white border-4 border-white dark:border-black hover:bg-accent-gold transition-colors flex items-center justify-center font-display text-2xl font-bold"
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <div
            ref={tournamentsScrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide px-4 sm:px-6 lg:px-8 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {MOCK_DATA.tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="flex-none w-[280px] sm:w-[320px] snap-start"
              >
                <div className="bg-primary dark:bg-purple border-4 border-white dark:border-black p-6 cursor-pointer hover:translate-x-1 hover:-translate-y-1 transition-transform">
                  <div className="text-4xl mb-4">🏆</div>
                  <h3 className="text-xl font-display font-bold text-black dark:text-white mb-2 uppercase">
                    {tournament.name}
                  </h3>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black font-display font-bold text-sm border-2 border-white dark:border-black">
                      {tournament.status}
                    </span>
                    <span className="font-bold text-black dark:text-white">
                      {tournament.teams} Teams
                    </span>
                  </div>
                  <button className="w-full py-2 bg-white dark:bg-black text-black dark:text-white border-4 border-black dark:border-white font-display font-bold uppercase hover:bg-accent-gold hover:border-accent-gold transition-colors">
                    Create Pool
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <div className="px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl sm:text-5xl font-display font-bold text-black dark:text-white mb-6 uppercase">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {MOCK_DATA.recentActivity.map((activity, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 border-4 border-black dark:border-white p-4 hover:translate-x-1 hover:-translate-y-1 transition-transform cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-accent-gold flex items-center justify-center text-2xl border-2 border-black dark:border-white">
                        {activity.type === 'elimination' && '🚫'}
                        {activity.type === 'message' && '💬'}
                        {activity.type === 'score' && '⚽'}
                      </div>
                      <div>
                        <p className="font-display font-bold text-lg text-black dark:text-white">
                          {activity.text}
                        </p>
                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                    <div className="text-2xl font-display font-bold">→</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button (Mobile) */}
      <button className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-accent dark:bg-magenta border-4 border-black dark:border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-all flex items-center justify-center text-3xl z-50">
        +
      </button>
    </div>
  );
}
