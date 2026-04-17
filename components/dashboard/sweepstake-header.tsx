"use client";

export interface SweepstakeHeaderProps {
  name: string;
  tournament: string;
  status: "active" | "upcoming" | "archived";
}

export default function SweepstakeHeader({ name, tournament, status }: SweepstakeHeaderProps) {
  const isActive = status === "active";

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-2 h-2 rounded-full ${
            isActive ? "bg-gradient-to-r from-green-400 to-emerald-500" : "bg-blue-500"
          }`}
        />
        <span
          className={`text-sm font-semibold text-transparent bg-clip-text uppercase tracking-wide ${
            isActive
              ? "bg-gradient-to-r from-green-500 to-emerald-600"
              : "bg-gradient-to-r from-blue-500 to-blue-600"
          }`}
        >
          {status}
        </span>
      </div>
      <h1 className="text-4xl lg:text-5xl font-display font-bold text-gray-900 dark:text-white mb-3">
        {name}
      </h1>
      <p className="text-lg text-gray-600 dark:text-gray-400">{tournament}</p>
    </div>
  );
}
