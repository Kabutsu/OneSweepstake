"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface ProgressBarProps {
  loading: boolean;
}

export default function ProgressBar({ loading }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (loading) {
      // Show and animate progress bar
      gsap.set(bar, { scaleX: 0, transformOrigin: "left" });
      
      if (prefersReducedMotion) {
        // Instant progress for reduced motion
        gsap.to(bar, { scaleX: 0.8, duration: 0.3 });
      } else {
        // Smooth animation
        animationRef.current = gsap.to(bar, {
          scaleX: 0.8,
          duration: 2,
          ease: "power2.out",
        });
      }
    } else {
      // Complete and hide progress bar
      if (animationRef.current) {
        animationRef.current.kill();
      }

      if (prefersReducedMotion) {
        gsap.set(bar, { scaleX: 0 });
      } else {
        gsap.to(bar, {
          scaleX: 1,
          duration: 0.2,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(bar, {
              opacity: 0,
              duration: 0.2,
              onComplete: () => {
                gsap.set(bar, { scaleX: 0, opacity: 1 });
              },
            });
          },
        });
      }
    }

    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, [loading]);

  return (
    <div className="absolute top-0 left-0 right-0 h-1 bg-transparent overflow-hidden rounded-t-lg">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-primary via-accent-light to-accent-gold dark:from-purple dark:via-magenta dark:to-cyan"
        style={{ transformOrigin: "left" }}
      />
    </div>
  );
}
