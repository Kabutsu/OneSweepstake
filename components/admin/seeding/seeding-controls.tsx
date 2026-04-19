import { memo } from "react";

interface SeedingControlsProps {
  onSave: () => void;
  saving: boolean;
}

function SeedingControls({ onSave, saving }: SeedingControlsProps) {
  return (
    <div className="mb-8">
      <p className="text-gray-700 dark:text-gray-300 font-body mb-4">
        Drag and drop teams into tiers to create a balanced seeding configuration. This will be used for the draw algorithm.
      </p>
      <button
        onClick={onSave}
        disabled={saving}
        className="px-6 py-3 bg-gradient-to-r from-purple to-magenta text-white font-display rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "Saving..." : "Save Seeding"}
      </button>
    </div>
  );
}

export default memo(SeedingControls);
