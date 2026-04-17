export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background */}
      <div
        className="
          absolute inset-0 -z-10
          bg-gradient-to-br 
          from-amber-100 via-orange-50 to-red-50
          dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900
        "
      />

      <div className="max-w-md w-full space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-3">
          <div className="h-12 w-64 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          <div className="h-4 w-48 mx-auto bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-6 sm:p-8 space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
