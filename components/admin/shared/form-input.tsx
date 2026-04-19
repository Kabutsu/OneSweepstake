"use client";

import { memo } from "react";

interface FormInputProps {
  label: string;
  type?: "text" | "date" | "number" | "url";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  min?: string;
  disabled?: boolean;
}

function FormInput({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
  disabled = false,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && "*"}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

export default memo(FormInput);
