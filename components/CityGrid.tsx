"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

type CityCell = {
  x: number;
  y: number;
  biome: string;
  description: string;
  type: string;
};

const biomeColors: Record<string, string> = {
  residential: "bg-green-400",
  commercial: "bg-blue-400",
  park: "bg-green-600",
  downtown: "bg-gray-700",
  industrial: "bg-orange-400",
  waterfront: "bg-cyan-400",
  "mixed-use": "bg-purple-400",
  civic: "bg-red-400",
  default: "bg-gray-400",
};

export default function CityGrid({ filename }: { filename: string }) {
  const [cells, setCells] = useState<CityCell[]>([]);
  const [gridSize, setGridSize] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<CityCell | null>(null);

  // Helper to determine which borders to apply for a cell on the outer edge of its block
  const getBlockBorders = (cell: CityCell, blockSize = 3) => {
    const relX = cell.x % blockSize;
    const relY = cell.y % blockSize;
    let borders = "";
    if (relY === 0) borders += " border-t-2";
    if (relY === blockSize - 1) borders += " border-b-2";
    if (relX === 0) borders += " border-l-2";
    if (relX === blockSize - 1) borders += " border-r-2";
    return borders;
  };

  useEffect(() => {
    fetch(`/${filename}`)
      .then((res) => res.text())
      .then((text) => {
        Papa.parse<CityCell>(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            setCells(results.data);
            const maxCoord =
              Math.max(...results.data.map((c) => Math.max(c.x, c.y))) + 1;
            setGridSize(maxCoord);
          },
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, [filename]);

  if (cells.length === 0) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex gap-8">
        <div>
          <div
            className="bg-gray-100 rounded overflow-hidden shadow-lg"
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${gridSize}, 40px)`,
              gridTemplateRows: `repeat(${gridSize}, 40px)`,
              gap: 0,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, index) => {
              const x = index % gridSize;
              const y = Math.floor(index / gridSize);
              const cell = cells.find((c) => c.x === x && c.y === y);
              if (!cell) {
                // Render as empty street (no cell)
                return (
                  <div
                    key={`${x}-${y}`}
                    className="bg-gray-300"
                    style={{ width: "40px", height: "40px" }}
                  />
                );
              }
              let className = "";
              let content = null;
              let interactive = false;
              // Use biome color for both sidewalk and building
              className = `${biomeColors[cell.biome] || biomeColors.default}`;
              if (cell.type === "sidewalk") {
                className += " hover:opacity-80 cursor-pointer";
                interactive = true;
              }
              // Add a border to the outer edge of each block (not each cell)
              className += getBlockBorders(cell);
              return (
                <div
                  key={`${x}-${y}`}
                  className={`${className} transition-opacity`}
                  style={{ width: "40px", height: "40px" }}
                  onMouseEnter={() => interactive && setHoveredCell(cell)}
                  onMouseLeave={() => interactive && setHoveredCell(null)}
                  title={cell.type}
                >
                  {content}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex-1">
          {hoveredCell && (
            <div className="p-6 bg-white rounded-lg shadow-md sticky top-0">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-xl capitalize">
                  {hoveredCell.type} ({hoveredCell.biome})
                </h3>
                <span className="text-sm text-gray-500">
                  ({hoveredCell.x}, {hoveredCell.y})
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed text-lg">
                {hoveredCell.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-8">
        <h3 className="font-semibold mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(biomeColors)
              .filter(([k]) => k !== "default")
              .map(([biome, color]) => (
                <div key={biome} className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${color} rounded`}></div>
                  <span className="text-sm capitalize">{biome}</span>
                </div>
              ))}
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-black bg-white"></div>
              <span className="text-sm">Block border</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm">Street (empty)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
