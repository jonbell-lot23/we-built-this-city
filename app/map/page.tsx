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
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [visited, setVisited] = useState<Set<string>>(new Set());
  const [bounds, setBounds] = useState({
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0,
  });

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
            const startCell = data.find((c) => c.walkable);
            if (startCell) {
              setStart({ x: startCell.x, y: startCell.y });
              setPos({ x: startCell.x, y: startCell.y });
              setVisited(new Set(["0,0"]));
              setBounds({ minX: 0, maxX: 0, minY: 0, maxY: 0 });
            }
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
      if (start) {
        const rx = nx - start.x;
        const ry = ny - start.y;
        setVisited((v) => new Set(v).add(`${rx},${ry}`));
        setBounds((b) => ({
          minX: Math.min(b.minX, rx),
          maxX: Math.max(b.maxX, rx),
          minY: Math.min(b.minY, ry),
          maxY: Math.max(b.maxY, ry),
        }));
      }
    }
  };

  const cell = getCell(pos.x, pos.y);

  const relX = start ? pos.x - start.x : 0;
  const relY = start ? pos.y - start.y : 0;
  const width = bounds.maxX - bounds.minX + 1;
  const height = bounds.maxY - bounds.minY + 1;

  return (
    <main className="min-h-screen bg-black text-green-400 font-mono p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="border border-green-400 p-4 mb-4 relative">
          <h1 className="text-xl mb-4">{">"} We Built This City</h1>
          <div className="grid grid-cols-5 gap-2 mb-4">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${width}, 2px)`,
                gridTemplateRows: `repeat(${height}, 2px)`,
                gap: "1px",
              }}
            >
              {Array.from({ length: width * height }).map((_, i) => {
                const x = bounds.minX + (i % width);
                const y = bounds.minY + Math.floor(i / width);
                const key = `${x},${y}`;
                const visitedCell = visited.has(key);
                const isCurrent = x === relX && y === relY;
                let cls = "w-0.5 h-0.5";
                if (visitedCell) {
                  if (isCurrent) {
                    cls += " bg-green-400";
                  } else {
                    cls += " bg-green-400/30";
                  }
                }
                return <div key={key} className={cls} />;
              })}
            </div>
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
