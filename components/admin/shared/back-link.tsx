import Link from "next/link";

interface BackLinkProps {
  href: string;
  label: string;
}

export default function BackLink({ href, label }: BackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-purple dark:hover:text-purple-400 transition-colors font-body text-sm"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">Back</span>
    </Link>
  );
}
