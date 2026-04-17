"use client";

export interface StatCardProps {
  label: string;
  value: string | number;
  gradient: "purple-magenta" | "orange-red" | "cyan-lime";
  emphasized?: boolean;
}

const gradientStyles = {
  "purple-magenta": {
    border: "rgb(168, 85, 247)",
    text: "from-purple to-magenta",
  },
  "orange-red": {
    border: "rgb(249, 115, 22)",
    text: "from-orange-500 to-red-600",
  },
  "cyan-lime": {
    border: "rgb(6, 182, 212)",
    text: "from-cyan to-lime",
  },
};

export default function StatCard({ label, value, gradient, emphasized = false }: StatCardProps) {
  const styles = gradientStyles[gradient];
  const borderWidth = emphasized ? "4px" : "2px";
  const shadow = emphasized
    ? "0 0 30px rgba(168, 85, 247, 0.3), 0 10px 15px -3px rgba(0, 0, 0, 0.1)"
    : undefined;

  return (
    <div
      className={`bg-white dark:bg-gray-900 rounded-2xl p-6 border-transparent bg-clip-padding ${
        emphasized ? "shadow-lg" : ""
      }`}
      style={{
        borderWidth,
        borderStyle: "solid",
        borderColor: styles.border,
        boxShadow: shadow,
      }}
    >
      <div
        className={`text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r ${styles.text} uppercase tracking-wide mb-2`}
      >
        {label}
      </div>
      <div
        className={`text-4xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r ${styles.text}`}
      >
        {value}
      </div>
    </div>
  );
}
