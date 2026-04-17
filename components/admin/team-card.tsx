"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Team } from "@/types/admin";
import Image from "next/image";

interface TeamCardProps {
  team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: team.id,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-3 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Team Crest */}
        {team.crest ? (
          <div className="relative w-10 h-10 flex-shrink-0">
            <Image
              src={team.crest}
              alt={team.name}
              fill
              className="object-contain"
              sizes="40px"
            />
          </div>
        ) : (
          <div className="w-10 h-10 flex-shrink-0 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-xs font-display font-bold text-gray-500 dark:text-gray-400">
              {team.tla}
            </span>
          </div>
        )}

        {/* Team Info */}
        <div className="flex-1 min-w-0">
          <div className="font-body font-semibold text-gray-900 dark:text-white text-sm truncate">
            {team.shortName || team.name}
          </div>
          <div className="font-body text-xs text-gray-500 dark:text-gray-400">
            {team.tla}
          </div>
        </div>
      </div>
    </div>
  );
}
