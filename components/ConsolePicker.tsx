"use client";

import { useState } from "react";
import type { RawgPlatform } from "@/lib/types";

interface ConsolePickerProps {
  platforms: RawgPlatform[];
  onSelect: (platform: RawgPlatform) => void;
}

export default function ConsolePicker({ platforms, onSelect }: ConsolePickerProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? platforms.filter((p) =>
        p.name.toLowerCase().includes(filter.toLowerCase())
      )
    : platforms;

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-200 mb-3">
        Pick a Console
      </h2>
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter platforms..."
        className="w-full px-4 py-2 mb-4 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No platforms match your filter.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {filtered.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => onSelect(p)}
              className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 text-sm text-left hover:border-blue-500 hover:text-blue-400 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
