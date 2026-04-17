export interface Team {
  id: string;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface TierConfig {
  tier: 1 | 2 | 3;
  teams: Team[];
}

export interface SeedingConfig {
  tiers: TierConfig[];
  lastUpdated: string;
}

export interface FootballDataTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

export interface FootballDataCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string;
}
