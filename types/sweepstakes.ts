export interface SweepstakeParticipant {
  id: string;
  userId: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  joinedAt: Date;
}

export interface SweepstakeDetails {
  id: string;
  name: string;
  joinCode: string;
  isPrivate: boolean;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: Date;
  tournamentId: string;
  tournamentName: string | null;
  tournamentLogo: string | null;
  creatorId: string;
  creatorDisplayName: string | null;
}

export interface PublicSweepstake {
  id: string;
  name: string;
  joinCode: string;
  maxParticipants: number;
  currentParticipants: number;
  createdAt: Date;
  tournamentId: string;
  tournamentName: string | null;
  tournamentLogo: string | null;
  creatorDisplayName: string | null;
}

export interface CreateSweepstakeInput {
  tournamentId: string;
  name: string;
  maxParticipants?: number;
}
