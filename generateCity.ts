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

const biomes = [
  "residential",
  "commercial",
  "park",
  "downtown",
  "industrial",
  "waterfront",
  "mixed-use",
  "civic",
];

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

function getBiome(blockIndex: number): string {
  return biomes[blockIndex % biomes.length];
}

async function main() {
  try {
    const args = process.argv.slice(2);
    const blockCount = parseInt(args[0], 10) || 1;
    const useDummyText = args.includes("--dummytext");
    const blockSize = 3;
    const gridSize = blockCount * blockSize;
    const grid: Cell[] = [];
    let blockId = 0;
    for (let by = 0; by < blockCount; by++) {
      for (let bx = 0; bx < blockCount; bx++) {
        const biome = getBiome(blockId);
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
