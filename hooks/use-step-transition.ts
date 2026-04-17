"use client";

import { useRef, RefObject } from "react";
import gsap from "gsap";

export type TransitionDirection = "forward" | "backward";

export interface UseStepTransitionResult {
  containerRef: RefObject<HTMLDivElement>;
  transitionTo: (newContent: HTMLElement, direction?: TransitionDirection) => Promise<void>;
}

/**
 * Hook for animating step transitions with GSAP
 * Provides smooth left/right slide animations with reduced-motion support
 */
export function useStepTransition(): UseStepTransitionResult {
  const containerRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);

  const transitionTo = async (
    newContent: HTMLElement,
    direction: TransitionDirection = "forward"
  ): Promise<void> => {
    const container = containerRef.current;
    if (!container || isAnimatingRef.current) return;

    isAnimatingRef.current = true;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const oldContent = container.firstElementChild as HTMLElement;

    if (prefersReducedMotion) {
      // Instant transition for reduced motion
      if (oldContent) {
        container.removeChild(oldContent);
      }
      container.appendChild(newContent);
      isAnimatingRef.current = false;
      return;
    }

    // Animated transition
    const slideDistance = direction === "forward" ? -100 : 100;
    const newSlideStart = direction === "forward" ? 100 : -100;

    // Position new content off-screen
    gsap.set(newContent, {
      x: `${newSlideStart}%`,
      opacity: 0,
      position: "absolute",
      width: "100%",
    });

    container.appendChild(newContent);

    // Create timeline for coordinated animation
    const tl = gsap.timeline({
      onComplete: () => {
        // Cleanup old content
        if (oldContent && container.contains(oldContent)) {
          container.removeChild(oldContent);
        }
        // Reset new content positioning
        gsap.set(newContent, { position: "relative", x: 0, opacity: 1 });
        isAnimatingRef.current = false;
      },
    });

    // Slide out old content
    if (oldContent) {
      tl.to(
        oldContent,
        {
          x: `${slideDistance}%`,
          opacity: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        0
      );
    }

    // Slide in new content
    tl.to(
      newContent,
      {
        x: 0,
        opacity: 1,
        duration: 0.4,
        ease: "power2.out",
      },
      0
    );

    await tl.then();
  };

  return {
    containerRef,
    transitionTo,
  };
}
