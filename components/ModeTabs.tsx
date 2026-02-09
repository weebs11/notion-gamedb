"use client";

import type { AppMode } from "@/lib/types";

interface ModeTabsProps {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
}

export default function ModeTabs({ mode, onModeChange }: ModeTabsProps) {
  return (
    <div className="flex gap-1 mb-6 bg-gray-800 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onModeChange("search")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === "search"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Search
      </button>
      <button
        type="button"
        onClick={() => onModeChange("browse")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === "browse"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Browse by Console
      </button>
      <button
        type="button"
        onClick={() => onModeChange("bulk")}
        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          mode === "bulk"
            ? "bg-blue-600 text-white"
            : "text-gray-400 hover:text-gray-200"
        }`}
      >
        Paste List
      </button>
    </div>
  );
}
