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

const MAP_SIZE = 15;
const CELL_SIZE = 2; // px, for 2x2 squares

export default function MapAdventure() {
  const [cells, setCells] = useState<Cell[]>([]);
  const [gridSize, setGridSize] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());

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
            const startCell = data.find((c) => c.x === 1 && c.y === 1);
            if (startCell) {
              setStart({ x: startCell.x, y: startCell.y });
              setPos({ x: startCell.x, y: startCell.y });
              setVisited(new Set([`${startCell.x},${startCell.y}`]));
            }
          },
        });
      })
      .catch((err) => console.error("Error loading CSV:", err));
  }, []);

  const getCell = (x: number, y: number) =>
    cells.find((c) => c.x === x && c.y === y);

  const canMove = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return false;
    const dest = getCell(nx, ny);
    return dest && dest.walkable;
  };

  const move = (dx: number, dy: number) => {
    const nx = pos.x + dx;
    const ny = pos.y + dy;
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return;
    const dest = getCell(nx, ny);
    if (dest && dest.walkable) {
      setPos({ x: nx, y: ny });
      setVisited((v) => new Set(v).add(`${nx},${ny}`));
    }
  };

  const cell = getCell(pos.x, pos.y);
  const half = Math.floor(MAP_SIZE / 2);

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="border border-green-400 p-4 mb-4 relative">
          <h1 className="text-xl mb-4">{">"} We Built This City</h1>
          <div className="grid grid-cols-5 gap-2 mb-4">
            <button
              className={`w-full py-2 border border-green-400 transition-colors ${
                canMove(-1, 0)
                  ? "hover:bg-green-400 hover:text-black"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => move(-1, 0)}
              disabled={!canMove(-1, 0)}
            >
              [W]
            </button>
            <button
              className={`w-full py-2 border border-green-400 transition-colors ${
                canMove(0, -1)
                  ? "hover:bg-green-400 hover:text-black"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => move(0, -1)}
              disabled={!canMove(0, -1)}
            >
              [N]
            </button>
            <button
              className={`w-full py-2 border border-green-400 transition-colors ${
                canMove(0, 1)
                  ? "hover:bg-green-400 hover:text-black"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => move(0, 1)}
              disabled={!canMove(0, 1)}
            >
              [S]
            </button>
            <button
              className={`w-full py-2 border border-green-400 transition-colors ${
                canMove(1, 0)
                  ? "hover:bg-green-400 hover:text-black"
                  : "opacity-50 cursor-not-allowed"
              }`}
              onClick={() => move(1, 0)}
              disabled={!canMove(1, 0)}
            >
              [E]
            </button>
            <div
              className="p-0 rounded"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${MAP_SIZE}, ${CELL_SIZE}px)`,
                gridTemplateRows: `repeat(${MAP_SIZE}, ${CELL_SIZE}px)`,
                gap: "1px",
                width: `${MAP_SIZE * (CELL_SIZE + 1)}px`,
                height: `${MAP_SIZE * (CELL_SIZE + 1)}px`,
              }}
            >
              {Array.from({ length: MAP_SIZE * MAP_SIZE }).map((_, i) => {
                const x = pos.x - half + (i % MAP_SIZE);
                const y = pos.y - half + Math.floor(i / MAP_SIZE);
                const isCurrent = x === pos.x && y === pos.y;
                const isVisited = visited.has(`${x},${y}`);
                let style: { [key: string]: string | number } = {
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  background: "#222",
                };
                let className = "";
                if (isCurrent) {
                  style.background = "#22ff22";
                  style.border = "1px solid #baffba";
                } else if (isVisited) {
                  style.background = "#4ade80"; // solid green
                }
                return (
                  <div key={`${x},${y}`} className={className} style={style} />
                );
              })}
            </div>
          </div>
          <div className="min-h-[120px] mt-4">
            <p className="mb-2">
              {">"} {cell?.description || "You see nothing special."}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
