"use client";

import { ButtonHTMLAttributes, forwardRef, useEffect, useRef } from "react";
import gsap from "gsap";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = "primary", loading = false, className = "", disabled, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(buttonRef.current);
        } else {
          ref.current = buttonRef.current;
        }
      }
    }, [ref]);

    // GSAP press animation with reduced-motion support
    useEffect(() => {
      const button = buttonRef.current;
      if (!button) return;

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) return;

      const handleMouseDown = () => {
        gsap.to(button, {
          scale: 0.97,
          duration: 0.1,
          ease: "power2.out",
        });
      };

      const handleMouseUp = () => {
        gsap.to(button, {
          scale: 1,
          duration: 0.15,
          ease: "power2.out",
        });
      };

      button.addEventListener("mousedown", handleMouseDown);
      button.addEventListener("mouseup", handleMouseUp);
      button.addEventListener("mouseleave", handleMouseUp);

      return () => {
        button.removeEventListener("mousedown", handleMouseDown);
        button.removeEventListener("mouseup", handleMouseUp);
        button.removeEventListener("mouseleave", handleMouseUp);
      };
    }, []);

    const baseStyles = `
      w-full flex items-center justify-center gap-2
      py-3 px-4 rounded-lg
      font-medium text-sm
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
    `;

    const variantStyles = {
      primary: `
        bg-primary text-white
        hover:bg-primary-light
        dark:bg-purple dark:hover:bg-purple-dark
        focus:ring-primary dark:focus:ring-purple
        shadow-md hover:shadow-lg
      `,
      secondary: `
        bg-gray-200 text-gray-900
        hover:bg-gray-300
        dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600
        focus:ring-gray-400 dark:focus:ring-gray-500
      `,
    };

    return (
      <button
        ref={buttonRef}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
