"use client";

import type { RawgGameListItem } from "@/lib/types";
import GameCard from "./GameCard";

interface GameResultsProps {
  games: RawgGameListItem[];
  selectedIds: Set<number>;
  onToggle: (id: number) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export default function GameResults({
  games,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: GameResultsProps) {
  if (games.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No games found. Try adjusting your filters.
      </div>
    );
  }

  const allSelected = games.every((g) => selectedIds.has(g.id));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={allSelected ? onDeselectAll : onSelectAll}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
        {selectedIds.size > 0 && (
          <span className="text-sm text-gray-400">
            {selectedIds.size} selected
          </span>
        )}
      </div>
      <div className="space-y-2">
        {games.map((game) => (
          <GameCard
            key={game.id}
            game={game}
            selected={selectedIds.has(game.id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
