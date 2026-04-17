"use client";

import { ReactNode, useEffect, useRef } from "react";
import gsap from "gsap";
import ProgressBar from "@/components/progress-bar";

export interface AuthContainerProps {
  children: ReactNode;
  error?: string | null;
  loading?: boolean;
}

export default function AuthContainer({ children, error, loading = false }: AuthContainerProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  // Subtle shadow pulse animation on card
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) return;

    // Very subtle continuous pulse
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    tl.to(card, {
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.3)",
      duration: 3,
      ease: "sine.inOut",
    });

    return () => {
      tl.kill();
    };
  }, []);

  // Smooth height transition for error messages
  useEffect(() => {
    const errorEl = errorRef.current;
    if (!errorEl) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (error) {
      if (prefersReducedMotion) {
        gsap.set(errorEl, { height: "auto", opacity: 1 });
      } else {
        gsap.fromTo(
          errorEl,
          { height: 0, opacity: 0 },
          {
            height: "auto",
            opacity: 1,
            duration: 0.3,
            ease: "power2.out",
          }
        );
      }
    } else {
      if (prefersReducedMotion) {
        gsap.set(errorEl, { height: 0, opacity: 0 });
      } else {
        gsap.to(errorEl, {
          height: 0,
          opacity: 0,
          duration: 0.2,
          ease: "power2.in",
        });
      }
    }
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle animated gradient background */}
      <div
        className="
          absolute inset-0 -z-10
          bg-gradient-to-br 
          from-amber-100 via-orange-50 to-red-50
          dark:from-purple-900 dark:via-fuchsia-900 dark:to-pink-900
          animate-gradient-shift
          bg-[length:200%_200%]
        "
      />

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-display font-bold text-gray-900 dark:text-white mb-2 tracking-wide">
            OneSweepstake
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-100 font-body">
            Setup, join and manage your own sweepstakes with friends and family
          </p>
        </div>

        {/* Card */}
        <div
          ref={cardRef}
          className="
            relative
            bg-white dark:bg-gray-800
            shadow-xl rounded-lg
            overflow-hidden
          "
        >
          {/* Progress bar */}
          <ProgressBar loading={loading} />

          <div className="p-6 sm:p-8 space-y-6">
            {/* Error message with smooth height transition */}
            <div ref={errorRef} className="overflow-hidden">
              {error && (
                <div className="p-3 rounded-md text-sm bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300 border border-red-200 dark:border-red-500/30">
                  {error}
                </div>
              )}
            </div>

            {/* Step content */}
            <div className="relative">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
