import { memo } from "react";

interface MessageBannerProps {
  type: "error" | "success";
  message: string;
}

function MessageBanner({ type, message }: MessageBannerProps) {
  const isError = type === "error";

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <div
        className={`${
          isError
            ? "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-700 dark:text-red-400"
            : "bg-green-50 dark:bg-green-900/20 border-green-500 text-green-700 dark:text-green-400"
        } border-2 rounded-xl p-4`}
      >
        <p className="font-body">{message}</p>
      </div>
    </div>
  );
}

export default memo(MessageBanner);
