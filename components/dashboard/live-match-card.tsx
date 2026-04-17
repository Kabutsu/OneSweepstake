"use client";

export interface LiveMatchCardProps {
  homeTeam: string;
  awayTeam: string;
  score: string;
  minute: number;
}

export default function LiveMatchCard({ homeTeam, awayTeam, score, minute }: LiveMatchCardProps) {
  const [homeScore, awayScore] = score.split("-");

  return (
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
            <div className="text-2xl font-bold mb-2">{homeTeam}</div>
            <div className="text-5xl font-display font-bold">{homeScore}</div>
          </div>

          <div className="px-8 text-center flex flex-col items-center">
            <div className="text-sm opacity-90 mb-1 pl-1">{minute}'</div>
            <div className="w-px h-12 bg-white/30" />
          </div>

          <div className="flex-1 text-center">
            <div className="text-2xl font-bold mb-2">{awayTeam}</div>
            <div className="text-5xl font-display font-bold">{awayScore}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
