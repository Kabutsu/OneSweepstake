/**
 * Shared validation utilities for form inputs
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const trimmedEmail = email.trim();
  
  if (!trimmedEmail) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true };
}

/**
 * Validate display name
 */
export function validateDisplayName(displayName: string): ValidationResult {
  const trimmedName = displayName.trim();

  if (!trimmedName) {
    return { isValid: false, error: "Display name is required" };
  }

  if (trimmedName.length > 50) {
    return { isValid: false, error: "Display name must be 50 characters or less" };
  }

  return { isValid: true };
}
