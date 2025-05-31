#!/usr/bin/env bun

import { OpenAI } from "openai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

type Cell = {
  x: number;
  y: number;
  type: "building" | "sidewalk";
  walkable: boolean;
  biome: string;
  blockId: number;
  description?: string;
};

const biomeChars: Record<string, string> = {
  residential: "R",
  commercial: "C",
  park: "P",
  downtown: "D",
  industrial: "I",
  waterfront: "W",
  "mixed-use": "M",
  civic: "V",
};

const biomes = Object.keys(biomeChars);

const dummyDescriptions: Record<string, string[]> = {
  building: [
    "You are inside a bustling apartment building.",
    "A quiet office space with large windows.",
    "A cozy bakery with the smell of fresh bread.",
    "A small grocery store packed with goods.",
    "A lively coffee shop with people chatting.",
  ],
  sidewalk: [
    "You are on a busy sidewalk in front of a shop.",
    "A quiet sidewalk lined with trees.",
    "Sidewalk with a bike rack and a bench.",
    "Sidewalk outside a bustling cafe.",
    "Sidewalk with a newspaper stand.",
  ],
};

function getNaturalBlockMap(blockCount: number): string[][] {
  // Create a 2D array of biomes with a natural city feel
  // More residential, parks near residential, commercial/downtown clustered, mixed-use as buffer, etc.
  const map: string[][] = [];
  for (let y = 0; y < blockCount; y++) {
    map[y] = [];
    for (let x = 0; x < blockCount; x++) {
      // Edges: waterfront or industrial
      if (y === 0 || y === blockCount - 1 || x === 0 || x === blockCount - 1) {
        map[y][x] =
          y === 0
            ? "waterfront"
            : x === 0 || x === blockCount - 1
            ? "industrial"
            : "waterfront";
        continue;
      }
      // Center: downtown core
      const center = Math.floor(blockCount / 2);
      const dist = Math.max(Math.abs(x - center), Math.abs(y - center));
      if (dist <= 1) {
        map[y][x] = "downtown";
        continue;
      }
      // Next ring: commercial and mixed-use
      if (dist === 2) {
        map[y][x] = Math.random() < 0.5 ? "commercial" : "mixed-use";
        continue;
      }
      // Parks scattered, especially near residential
      if (Math.random() < 0.08) {
        map[y][x] = "park";
        continue;
      }
      // Civic buildings near downtown
      if (dist === 3 && Math.random() < 0.2) {
        map[y][x] = "civic";
        continue;
      }
      // Otherwise, mostly residential
      map[y][x] = "residential";
    }
  }
  // Optionally, smooth parks to be near each other
  for (let y = 1; y < blockCount - 1; y++) {
    for (let x = 1; x < blockCount - 1; x++) {
      if (
        map[y][x] === "residential" &&
        (map[y - 1][x] === "park" ||
          map[y + 1][x] === "park" ||
          map[y][x - 1] === "park" ||
          map[y][x + 1] === "park")
      ) {
        if (Math.random() < 0.3) map[y][x] = "park";
      }
    }
  }
  return map;
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const blockCount = parseInt(args[0], 10) || 1;
    const useDummyText = args.includes("--dummytext");
    const blockSize = 3;
    const gridSize = blockCount * blockSize;
    // 1. Generate block biome map
    const blockMap = getNaturalBlockMap(blockCount);
    // 2. Write blockmap.txt
    const blockmapText = blockMap
      .map((row) => row.map((b) => biomeChars[b] || "?").join(""))
      .join("\n");
    await Bun.write("public/blockmap.txt", blockmapText);
    // 3. Generate grid using blockMap
    const grid: Cell[] = [];
    let blockId = 0;
    for (let by = 0; by < blockCount; by++) {
      for (let bx = 0; bx < blockCount; bx++) {
        const biome = blockMap[by][bx];
        for (let y = 0; y < blockSize; y++) {
          for (let x = 0; x < blockSize; x++) {
            const gx = bx * blockSize + x;
            const gy = by * blockSize + y;
            let type: Cell["type"] =
              x === 1 && y === 1 ? "building" : "sidewalk";
            let walkable = type === "sidewalk";
            let description: string | undefined = undefined;
            if (useDummyText) {
              const options = dummyDescriptions[type];
              description = options[Math.floor(Math.random() * options.length)];
            }
            grid.push({
              x: gx,
              y: gy,
              type,
              walkable,
              biome,
              blockId,
              description,
            });
          }
        }
        blockId++;
      }
    }
    // Write output
    const header = "x,y,type,walkable,biome,blockId,description";
    const rows = grid.map((c) =>
      [
        c.x,
        c.y,
        c.type,
        c.walkable,
        c.biome,
        c.blockId,
        JSON.stringify(c.description || ""),
      ].join(",")
    );
    const out = [header, ...rows].join("\n");
    const timestamp = Date.now();
    const filename = `city_${gridSize}x${gridSize}_${timestamp}.csv`;
    const publicPath = `public/${filename}`;
    console.log("\n💾 Writing CSV file...");
    await Bun.write(publicPath, out);
    console.log(`✨ Done! Wrote ${grid.length} cells to ${publicPath}`);
    console.log(`🗺️  Block map written to public/blockmap.txt`);
    // Show cell type distribution
    const typeCount = grid.reduce((acc, cell) => {
      acc[cell.type] = (acc[cell.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("\n📈 Cell type distribution:");
    Object.entries(typeCount).forEach(([type, count]) => {
      const percentage = ((count / grid.length) * 100).toFixed(1);
      console.log(`   ${type}: ${count} cells (${percentage}%)`);
    });
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

main();
