"use client";

import { useState } from "react";

interface PasteListInputProps {
  onSubmit: (names: string[]) => void;
  loading: boolean;
  progress: string;
}

export default function PasteListInput({ onSubmit, loading, progress }: PasteListInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    const names = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    if (names.length > 0) {
      onSubmit(names);
    }
  }

  const lineCount = text
    .split("\n")
    .filter((line) => line.trim().length > 0).length;

  return (
    <div className="space-y-3">
      <label className="block text-sm text-gray-400">
        Paste game names, one per line
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={"The Legend of Zelda: Breath of the Wild\nHollow Knight\nCeleste\nHades"}
        rows={10}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {lineCount} game{lineCount !== 1 ? "s" : ""} entered
        </span>
        <button
          onClick={handleSubmit}
          disabled={loading || lineCount === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
        >
          {loading ? progress || "Searching..." : "Search All"}
        </button>
      </div>
    </div>
  );
}
