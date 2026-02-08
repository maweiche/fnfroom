"use client";

import { motion } from "framer-motion";

interface FilterToggleProps {
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
  className?: string;
}

export function FilterToggle({
  options,
  activeOption,
  onChange,
  className = "",
}: FilterToggleProps) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {options.map((option) => {
        const isActive = activeOption === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              relative h-10 px-4 rounded-lg font-medium text-sm transition-colors duration-150
              ${
                isActive
                  ? "text-primary-dark"
                  : "text-foreground hover:text-primary"
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="activeFilter"
                className="absolute inset-0 bg-primary rounded-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
            <span className="relative z-10">{option}</span>
          </button>
        );
      })}
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: string[];
  activeOption: string;
  onChange: (option: string) => void;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  activeOption,
  onChange,
  className = "",
}: FilterDropdownProps) {
  return (
    <div className={`inline-block ${className}`}>
      <select
        value={activeOption}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 px-4 pr-8 rounded-lg border border-border bg-card text-foreground font-medium text-sm appearance-none cursor-pointer hover:border-primary transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23171717' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
        }}
      >
        <option value="all">{label}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
