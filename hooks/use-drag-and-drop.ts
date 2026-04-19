"use client";

import { useState, useCallback } from "react";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import type { Team } from "@/types/admin";

interface UseDragAndDropResult {
  activeTeam: Team | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useDragAndDrop(
  findTeamById: (id: string) => Team | null,
  moveTeam: (teamId: string, targetTier: "unassigned" | "tier-1" | "tier-2" | "tier-3") => void
): UseDragAndDropResult {
  const [activeTeam, setActiveTeam] = useState<Team | null>(null);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const team = findTeamById(String(event.active.id));
      setActiveTeam(team);
    },
    [findTeamById]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveTeam(null);

      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      // If dropped on the same container, do nothing
      if (activeId === overId) return;

      // Move the team to the target tier
      if (
        overId === "unassigned" ||
        overId === "tier-1" ||
        overId === "tier-2" ||
        overId === "tier-3"
      ) {
        moveTeam(activeId, overId);
      }
    },
    [moveTeam]
  );

  return {
    activeTeam,
    handleDragStart,
    handleDragEnd,
  };
}
