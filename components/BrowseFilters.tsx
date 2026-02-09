"use client";

import { useState } from "react";
import type { RawgPlatform, RawgGenre, ConsoleBrowseFilters } from "@/lib/types";

interface BrowseFiltersProps {
  platform: RawgPlatform;
  genres: RawgGenre[];
  onApply: (filters: ConsoleBrowseFilters) => void;
  onChangePlatform: () => void;
  loading: boolean;
}

const ORDERING_OPTIONS = [
  { value: "-metacritic", label: "Metacritic (High → Low)" },
  { value: "-rating", label: "Rating (High → Low)" },
  { value: "-released", label: "Release Date (Newest)" },
  { value: "released", label: "Release Date (Oldest)" },
  { value: "name", label: "Name A→Z" },
  { value: "-name", label: "Name Z→A" },
];

export default function BrowseFilters({
  platform,
  genres,
  onApply,
  onChangePlatform,
  loading,
}: BrowseFiltersProps) {
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [ordering, setOrdering] = useState("-metacritic");
  const [showGenres, setShowGenres] = useState(false);

  function toggleGenre(slug: string) {
    setSelectedGenres((prev) =>
      prev.includes(slug) ? prev.filter((g) => g !== slug) : [...prev, slug]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onApply({ genres: selectedGenres, yearFrom, yearTo, ordering });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-gray-400 text-sm">Console:</span>
        <span className="text-gray-100 font-medium">{platform.name}</span>
        <button
          type="button"
          onClick={onChangePlatform}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Change
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Genre selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGenres(!showGenres)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-left text-gray-300 hover:border-gray-600"
          >
            {selectedGenres.length > 0
              ? `${selectedGenres.length} genre(s)`
              : "All Genres"}
            <span className="float-right">▾</span>
          </button>
          {showGenres && (
            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
              {genres.map((g) => (
                <label
                  key={g.id}
                  className="flex items-center px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g.slug)}
                    onChange={() => toggleGenre(g.slug)}
                    className="mr-2"
                  />
                  {g.name}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sort order */}
        <div>
          <select
            value={ordering}
            onChange={(e) => setOrdering(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-blue-500"
          >
            {ORDERING_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Year range + submit */}
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={yearFrom}
            onChange={(e) => setYearFrom(e.target.value)}
            placeholder="From"
            min="1970"
            max="2030"
            className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
          <span className="text-gray-500">–</span>
          <input
            type="number"
            value={yearTo}
            onChange={(e) => setYearTo(e.target.value)}
            placeholder="To"
            min="1970"
            max="2030"
            className="w-20 px-2 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg font-medium transition-colors"
        >
          {loading ? "Loading..." : "Load Games"}
        </button>
      </div>
    </form>
  );
}
