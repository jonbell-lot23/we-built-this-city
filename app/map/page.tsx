"use client";

import { useState, useEffect } from "react";
import Papa from "papaparse";

interface Cell {
  x: number;
  y: number;
  type: string;
  walkable: boolean;
  biome: string;
  blockId: number;
  description: string;
}

const FILE = "enhanced_city.csv";

export default function MapAdventure() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [gridSize, setGridSize] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetch(`/${FILE}`)
      .then((res) => res.text())
      .then((text) => {
        Papa.parse<Cell>(text, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const data = results.data as Cell[];
            setCells(data);
            const size = Math.max(...data.map((c) => Math.max(c.x, c.y))) + 1;
            setGridSize(size);
            const start = data.find((c) => c.walkable);
            if (start) setPos({ x: start.x, y: start.y });
          },
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

  const getCell = (x: number, y: number) =>
    cells.find((c) => c.x === x && c.y === y);

  const move = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return;
    const dest = getCell(nx, ny);
    if (dest && dest.walkable) {
      setPos({ x: nx, y: ny });
    }
  };

  const cell = getCell(pos.x, pos.y);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="border border-green-400 p-4 mb-4">
          <h1 className="text-xl mb-4">{">"} We Built This City</h1>
          <div className="grid grid-cols-4 gap-2 mb-4">
            <button
              className="w-full py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              onClick={() => move(-1, 0)}
            >
              [W]
            </button>
            <button
              className="w-full py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              onClick={() => move(0, -1)}
            >
              [N]
            </button>
            <button
              className="w-full py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              onClick={() => move(0, 1)}
            >
              [S]
            </button>
            <button
              className="w-full py-2 border border-green-400 hover:bg-green-400 hover:text-black transition-colors"
              onClick={() => move(1, 0)}
            >
              [E]
            </button>
          </div>
          <div className="min-h-[120px]">
            <p className="mb-2">
              {">"} {cell?.description || "You see nothing special."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
