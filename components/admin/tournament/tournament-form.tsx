"use client";

import FormInput from "../shared/form-input";

export interface TournamentFormData {
  name: string;
  startDate: string;
  endDate: string;
  teamCount: string;
  logo: string;
}

interface TournamentFormProps {
  data: TournamentFormData;
  onChange: (field: keyof TournamentFormData, value: string) => void;
}

export default function TournamentForm({ data, onChange }: TournamentFormProps) {
  return (
    <div className="space-y-4">
      <FormInput
        label="Tournament Name"
        value={data.name}
        onChange={(value) => onChange("name", value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Start Date"
          type="date"
          value={data.startDate}
          onChange={(value) => onChange("startDate", value)}
          required
        />
        <FormInput
          label="End Date"
          type="date"
          value={data.endDate}
          onChange={(value) => onChange("endDate", value)}
          required
        />
      </div>

      <FormInput
        label="Number of Teams"
        type="number"
        value={data.teamCount}
        onChange={(value) => onChange("teamCount", value)}
        min="1"
        required
      />

      <div>
        <FormInput
          label="Logo URL"
          type="url"
          value={data.logo}
          onChange={(value) => onChange("logo", value)}
        />
        {data.logo && (
          <img
            src={data.logo}
            alt="Tournament logo preview"
            className="mt-2 h-16 object-contain"
          />
        )}
      </div>
    </div>
  );
}
