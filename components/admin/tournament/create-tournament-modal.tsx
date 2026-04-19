"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import CompetitionIdInput from "./competition-id-input";
import TournamentForm, { TournamentFormData } from "./tournament-form";

interface CreateTournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FullTournamentFormData extends TournamentFormData {
  apiId: string;
}

export default function CreateTournamentModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateTournamentModalProps) {
  const [formData, setFormData] = useState<FullTournamentFormData>({
    apiId: "",
    name: "",
    startDate: "",
    endDate: "",
    teamCount: "",
    logo: "",
  });
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState("");

  const createMutation = trpc.admin.createTournament.useMutation({
    onSuccess: () => {
      onSuccess();
      resetForm();
    },
    onError: (error) => setError(error.message),
  });

  const resetForm = () => {
    setFormData({
      apiId: "",
      name: "",
      startDate: "",
      endDate: "",
      teamCount: "",
      logo: "",
    });
    setDataFetched(false);
    setError("");
  };

  const handleClose = () => {
    if (!createMutation.isPending) {
      resetForm();
      onClose();
    }
  };

  const handleDataFetched = (data: Omit<FullTournamentFormData, "teamCount">) => {
    setFormData({ ...data, teamCount: "" });
    setDataFetched(true);
  };

  const handleFieldChange = (field: keyof TournamentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.startDate || !formData.endDate || !formData.teamCount) {
      setError("Please fill in all required fields");
      return;
    }

    const slug = formData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    createMutation.mutate({
      name: formData.name,
      slug,
      apiId: formData.apiId,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: new Date(formData.endDate).toISOString(),
      teamCount: parseInt(formData.teamCount, 10),
      logo: formData.logo || null,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={handleClose}
        />

        <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
              Create Tournament
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none"
              disabled={createMutation.isPending}
            >
              &#x2715;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <CompetitionIdInput onDataFetched={handleDataFetched} />

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            {dataFetched && (
              <>
                <TournamentForm data={formData} onChange={handleFieldChange} />

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
                    className="px-6 py-2 bg-purple hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    {createMutation.isPending ? "Creating..." : "Create Tournament"}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
