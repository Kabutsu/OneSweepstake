export type SweepstakeStatus = "active" | "upcoming" | "archived";

export interface User {
  displayName: string | null;
  avatarUrl: string | null;
  isAdmin: boolean;
}

export interface LiveMatch {
  home: string;
  away: string;
  score: string;
  minute: number;
}

export interface Sweepstake {
  id: string;
  name: string;
  tournament: string;
  rank?: number;
  teams?: number;
  participants: number;
  status: SweepstakeStatus;
}
