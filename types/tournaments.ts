export type TournamentStatus = "upcoming" | "active" | "completed";

export interface Tournament {
  id: string;
  name: string;
  slug: string;
  apiId: string;
  startDate: Date;
  endDate: Date;
  teamCount: number;
  isActive: boolean;
  logo: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentWithStatus extends Tournament {
  status: TournamentStatus;
}

/**
 * Determine tournament status based on start and end dates
 */
export function getTournamentStatus(startDate: Date, endDate: Date): TournamentStatus {
  const now = new Date();

  if (now < startDate) {
    return "upcoming";
  }

  if (now > endDate) {
    return "completed";
  }

  return "active";
}
