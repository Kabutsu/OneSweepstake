"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TeamCard from "./team-card";
import type { Team } from "@/types/admin";

interface TierColumnProps {
  id: string;
  title: string;
  subtitle?: string;
  teams: Team[];
  gradient: "purple-magenta" | "orange-red" | "cyan-lime" | "gray";
}

const gradientStyles = {
  "purple-magenta": {
    border: "rgb(168, 85, 247)",
    header: "from-purple to-magenta",
  },
  "orange-red": {
    border: "rgb(249, 115, 22)",
    header: "from-orange-500 to-red-600",
  },
  "cyan-lime": {
    border: "rgb(6, 182, 212)",
    header: "from-cyan to-lime",
  },
  gray: {
    border: "rgb(156, 163, 175)",
    header: "from-gray-500 to-gray-600",
  },
};

export default function TierColumn({ id, title, subtitle, teams, gradient }: TierColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const styles = gradientStyles[gradient];

  return (
    <div
      ref={setNodeRef}
      className={`bg-white dark:bg-gray-900 rounded-2xl border-2 transition-all ${
        isOver
          ? "border-purple-500 dark:border-purple-400 shadow-2xl scale-105"
          : "border-transparent"
      }`}
      style={{
        borderColor: isOver ? styles.border : undefined,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <h3
          className={`text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${styles.header}`}
        >
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm text-gray-600 dark:text-gray-400 font-body mt-1">
            {subtitle}
          </p>
        )}
        <div className="mt-2 text-xs font-body font-semibold text-gray-500 dark:text-gray-500">
          {teams.length} {teams.length === 1 ? "team" : "teams"}
        </div>
      </div>

      {/* Teams List */}
      <div className="p-4 space-y-3 min-h-[500px] max-h-[600px] overflow-y-auto">
        <SortableContext items={teams.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {teams.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-600 text-sm font-body">
              Drop teams here
            </div>
          ) : (
            teams.map((team) => <TeamCard key={team.id} team={team} />)
          )}
        </SortableContext>
      </div>
    </div>
  );
}
