"use client";

import { forwardRef, InputHTMLAttributes, useEffect, useRef } from "react";
import gsap from "gsap";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(inputRef.current);
        } else {
          ref.current = inputRef.current;
        }
      }
    }, [ref]);

    // GSAP focus animation with reduced-motion support
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const handleFocus = () => {
        gsap.to(input, {
          scale: 1.01,
          duration: 0.2,
          ease: "power2.out",
        });
      };

      const handleBlur = () => {
        gsap.to(input, {
          scale: 1,
          duration: 0.2,
          ease: "power2.out",
        });
      };

      input.addEventListener("focus", handleFocus);
      input.addEventListener("blur", handleBlur);

      return () => {
        input.removeEventListener("focus", handleFocus);
        input.removeEventListener("blur", handleBlur);
      };
    }, []);

    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div ref={containerRef} className="space-y-2">
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
        <input
          ref={inputRef}
          id={inputId}
          className={`
            w-full px-4 py-3 rounded-lg
            border-2 transition-all duration-200
            ${
              error
                ? "border-red-500 dark:border-red-400"
                : "border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-purple"
            }
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2
            ${
              error
                ? "focus:ring-red-500/20"
                : "focus:ring-primary/20 dark:focus:ring-purple/20"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-700 dark:text-red-300 animate-[shake_0.3s_ease-in-out]">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
