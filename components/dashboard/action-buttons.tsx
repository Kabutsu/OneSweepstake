"use client";

export interface ActionButtonsProps {
  onViewLeaderboard: () => void;
  onViewTeams: () => void;
  onChat: () => void;
}

export default function ActionButtons({
  onViewLeaderboard,
  onViewTeams,
  onChat,
}: ActionButtonsProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <button
        onClick={onViewLeaderboard}
        className="flex-1 py-4 px-6 bg-gradient-to-r from-purple to-magenta text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all active:scale-95"
      >
        View Leaderboard
      </button>
      <button
        onClick={onViewTeams}
        className="flex-1 py-4 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple dark:hover:border-purple transition-all"
      >
        View Teams
      </button>
      <button
        onClick={onChat}
        className="flex-1 py-4 px-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-cyan dark:hover:border-cyan transition-all"
      >
        Chat
      </button>
    </div>
  );
}
