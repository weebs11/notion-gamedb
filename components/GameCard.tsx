"use client";

import type { RawgGameListItem } from "@/lib/types";

interface GameCardProps {
  game: RawgGameListItem;
  selected: boolean;
  onToggle: (id: number) => void;
}

function metacriticColor(score: number | null): string {
  if (score == null) return "bg-gray-700 text-gray-400";
  if (score >= 75) return "bg-green-900 text-green-300";
  if (score >= 50) return "bg-yellow-900 text-yellow-300";
  return "bg-red-900 text-red-300";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function GameCard({ game, selected, onToggle }: GameCardProps) {
  return (
    <div
      onClick={() => onToggle(game.id)}
      className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors ${
        selected
          ? "bg-blue-950 border border-blue-600"
          : "bg-gray-900 border border-gray-800 hover:border-gray-700"
      }`}
    >
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(game.id)}
        className="shrink-0 w-4 h-4 accent-blue-500"
        onClick={(e) => e.stopPropagation()}
      />

      {/* Game info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-100 truncate">{game.name}</div>
        {game.platforms && game.platforms.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {[...game.platforms].sort((a, b) => a.platform.name.localeCompare(b.platform.name)).map((p) => (
              <span
                key={p.platform.id}
                className="px-1.5 py-0.5 text-xs bg-gray-700 border border-gray-600 text-gray-300 rounded"
              >
                {p.platform.name}
              </span>
            ))}
          </div>
        )}
        {game.genres && game.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {[...game.genres].sort((a, b) => a.name.localeCompare(b.name)).map((g) => (
              <span
                key={g.id}
                className="px-1.5 py-0.5 text-xs bg-gray-800 text-gray-400 rounded"
              >
                {g.name}
              </span>
            ))}
          </div>
        )}
        {game.released && (
          <div className="mt-1 text-xs text-gray-400">
            {formatDate(game.released)}
          </div>
        )}
      </div>

      {/* Scores */}
      <div className="shrink-0 flex items-center gap-2">
        {game.rating > 0 && (
          <span className="text-xs text-gray-400">{game.rating.toFixed(1)}/5</span>
        )}
        <span
          className={`inline-block px-2 py-0.5 text-xs font-mono rounded ${metacriticColor(
            game.metacritic
          )}`}
        >
          {game.metacritic ?? "–"}
        </span>
      </div>
    </div>
  );
}
