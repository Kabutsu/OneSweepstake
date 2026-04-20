"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import FormInput from "@/components/admin/shared/form-input";
import type { TournamentWithStatus } from "@/types/tournaments";

interface CreateSweepstakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tournament: TournamentWithStatus;
  onSuccess: (sweepstakeId: string) => void;
}

export default function CreateSweepstakeModal({
  isOpen,
  onClose,
  tournament,
  onSuccess,
}: CreateSweepstakeModalProps) {
  const [name, setName] = useState("");
  const [maxParticipants, setMaxParticipants] = useState(tournament.teamCount.toString());
  const [error, setError] = useState("");

  const createMutation = trpc.sweepstakes.create.useMutation({
    onSuccess: (data) => {
      onSuccess(data.sweepstake.id);
      resetForm();
    },
    onError: (error) => setError(error.message),
  });

  const resetForm = () => {
    setName("");
    setMaxParticipants(tournament.teamCount.toString());
    setError("");
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter a sweepstake name");
      return;
    }

    const participantCount = parseInt(maxParticipants, 10);
    if (isNaN(participantCount) || participantCount < 2) {
      setError("Participant limit must be at least 2");
      return;
    }

    if (participantCount > tournament.teamCount) {
      setError(`Participant limit cannot exceed ${tournament.teamCount}`);
      return;
    }

    createMutation.mutate({
      tournamentId: tournament.id,
      name: name.trim(),
      maxParticipants: participantCount,
    });
  };

  // Reset max participants when tournament changes
  useEffect(() => {
    setMaxParticipants(tournament.teamCount.toString());
  }, [tournament.teamCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Create Sweepstake
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
              disabled={createMutation.isPending}
            >
              &#x2715;
            </button>
          </div>

          {/* Tournament Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-purple/10 to-magenta/10 rounded-lg border border-purple/20">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Tournament</p>
            <p className="font-semibold text-gray-900 dark:text-white">{tournament.name}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <FormInput
              label="Sweepstake Name"
              type="text"
              value={name}
              onChange={setName}
              placeholder="e.g., Office World Cup Pool"
              required
              disabled={createMutation.isPending}
            />

            <FormInput
              label="Participant Limit"
              type="number"
              value={maxParticipants}
              onChange={setMaxParticipants}
              min="2"
              required
              disabled={createMutation.isPending}
            />

            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-3">
              Maximum {tournament.teamCount} participants (one per team)
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={createMutation.isPending}
                className="px-6 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-semibold rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="px-6 py-2 bg-gradient-to-r from-purple to-magenta hover:from-purple-700 hover:to-magenta-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-lg transition-all shadow-sm"
              >
                {createMutation.isPending ? "Creating..." : "Create Sweepstake"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
