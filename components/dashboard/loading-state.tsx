"use client";

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
      <div className="flex items-center gap-3">
        {/* Dot 1 - Purple */}
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-br from-purple to-purple-dark"
          style={{
            animation: 'bounce-dot 1.4s ease-in-out infinite',
            animationDelay: '0s',
          }}
        />
        
        {/* Dot 2 - Orange */}
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-br from-orange-500 to-red-600"
          style={{
            animation: 'bounce-dot 1.4s ease-in-out infinite',
            animationDelay: '0.2s',
          }}
        />
        
        {/* Dot 3 - Cyan */}
        <div
          className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan to-lime"
          style={{
            animation: 'bounce-dot 1.4s ease-in-out infinite',
            animationDelay: '0.4s',
          }}
        />
      </div>

      <style>{`
        @keyframes bounce-dot {
          0%, 80%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.8;
          }
          40% {
            transform: translateY(-20px) scale(1.1);
            opacity: 1;
          }
        }
        
        @media (prefers-reduced-motion: reduce) {
          div[style*="bounce-dot"] {
            animation: none !important;
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
}
