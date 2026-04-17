import { env } from "./env";
import type { FootballDataTeam } from "@/types/admin";

const API_BASE_URL = "https://api.football-data.org/v4";

// Simple in-memory rate limiter (10 requests per minute)
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10;
  private readonly timeWindow = 60000; // 1 minute in ms

  async checkLimit(): Promise<boolean> {
    const now = Date.now();
    // Remove requests older than 1 minute
    this.requests = this.requests.filter((time) => now - time < this.timeWindow);

    if (this.requests.length >= this.maxRequests) {
      return false;
    }

    this.requests.push(now);
    return true;
  }

  getTimeUntilReset(): number {
    if (this.requests.length === 0) return 0;
    const oldestRequest = Math.min(...this.requests);
    const timeElapsed = Date.now() - oldestRequest;
    return Math.max(0, this.timeWindow - timeElapsed);
  }
}

const rateLimiter = new RateLimiter();

export async function fetchCompetitionTeams(competitionId: string): Promise<FootballDataTeam[]> {
  // Check rate limit
  const canProceed = await rateLimiter.checkLimit();
  if (!canProceed) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilReset() / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
  }

  const response = await fetch(
    `${API_BASE_URL}/competitions/${competitionId}/teams`,
    {
      headers: {
        "X-Auth-Token": env.api.footballDataApiKey,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    throw new Error(`Failed to fetch teams: ${response.statusText}`);
  }

  const data = await response.json();
  return data.teams || [];
}

export async function fetchCompetition(competitionId: string) {
  // Check rate limit
  const canProceed = await rateLimiter.checkLimit();
  if (!canProceed) {
    const waitTime = Math.ceil(rateLimiter.getTimeUntilReset() / 1000);
    throw new Error(`Rate limit exceeded. Please wait ${waitTime} seconds.`);
  }

  const response = await fetch(
    `${API_BASE_URL}/competitions/${competitionId}`,
    {
      headers: {
        "X-Auth-Token": env.api.footballDataApiKey,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error("Rate limit exceeded. Please try again later.");
    }
    throw new Error(`Failed to fetch competition: ${response.statusText}`);
  }

  return response.json();
}
