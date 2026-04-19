import { memo } from "react";
import TierColumn from "./tier-column";
import type { Team } from "@/types/admin";

interface TierGridProps {
  unassignedTeams: Team[];
  tier1Teams: Team[];
  tier2Teams: Team[];
  tier3Teams: Team[];
}

function TierGrid({ unassignedTeams, tier1Teams, tier2Teams, tier3Teams }: TierGridProps) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <TierColumn
        id="unassigned"
        title="Unassigned Teams"
        teams={unassignedTeams}
        gradient="gray"
      />
      <TierColumn
        id="tier-1"
        title="Tier 1"
        subtitle="Strongest Teams"
        teams={tier1Teams}
        gradient="purple-magenta"
      />
      <TierColumn
        id="tier-2"
        title="Tier 2"
        subtitle="Medium Strength"
        teams={tier2Teams}
        gradient="orange-red"
      />
      <TierColumn
        id="tier-3"
        title="Tier 3"
        subtitle="Developing Teams"
        teams={tier3Teams}
        gradient="cyan-lime"
      />
    </div>
  );
}

export default memo(TierGrid);
