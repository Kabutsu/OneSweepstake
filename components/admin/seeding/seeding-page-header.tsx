import ThemeToggle from "@/components/theme-toggle";
import BackLink from "../shared/back-link";

interface SeedingPageHeaderProps {
  tournamentName: string;
}

export default function SeedingPageHeader({ tournamentName }: SeedingPageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <BackLink href="/admin" label="Back to Admin Panel" />
          <ThemeToggle />
        </div>
        <div>
          <h1 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple to-magenta">
            Tournament Seeding
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-body mt-1">
            {tournamentName}
          </p>
        </div>
      </div>
    </header>
  );
}
