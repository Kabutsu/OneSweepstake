"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import FormInput from "../shared/form-input";

interface CompetitionIdInputProps {
  onDataFetched: (data: {
    name: string;
    startDate: string;
    endDate: string;
    logo: string;
    apiId: string;
  }) => void;
}

export default function CompetitionIdInput({ onDataFetched }: CompetitionIdInputProps) {
  const [competitionId, setCompetitionId] = useState("");
  const [error, setError] = useState("");

  const fetchQuery = trpc.admin.fetchCompetitionData.useQuery(
    { competitionId },
    { enabled: false }
  );

  const handleFetch = async () => {
    if (!competitionId.trim()) {
      setError("Please enter a competition ID");
      return;
    }

    setError("");

    try {
      const result = await fetchQuery.refetch();
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      if (result.data) {
        const { competition } = result.data;
        onDataFetched({
          name: competition.name,
          startDate: competition.startDate 
            ? new Date(competition.startDate).toISOString().split('T')[0] 
            : "",
          endDate: competition.endDate 
            ? new Date(competition.endDate).toISOString().split('T')[0] 
            : "",
          logo: competition.emblem,
          apiId: competitionId,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch competition data");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <FormInput
            label="Football-Data.org Competition ID"
            value={competitionId}
            onChange={setCompetitionId}
            placeholder="e.g., WC for World Cup"
          />
        </div>
        <button
          type="button"
          onClick={handleFetch}
          disabled={fetchQuery.isFetching}
          className="px-6 py-2 bg-purple hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors h-[42px]"
        >
          {fetchQuery.isFetching ? "Fetching..." : "Fetch Data"}
        </button>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
