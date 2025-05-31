#!/usr/bin/env bun
import fs from 'fs'
import Papa from 'papaparse'
import * as dotenv from 'dotenv'

dotenv.config()

interface Cell {
  x: number
  y: number
  type: 'building' | 'sidewalk'
  walkable: boolean
  biome: string
  blockId: number
  description?: string
}

const biomeChars: Record<string, string> = {
  residential: 'R',
  commercial: 'C',
  park: 'P',
  downtown: 'D',
  industrial: 'I',
  waterfront: 'W',
  'mixed-use': 'M',
  civic: 'V',
}

const biomes = Object.keys(biomeChars)

const dummyDescriptions: Record<string, string[]> = {
  building: [
    'You are inside a bustling apartment building.',
    'A quiet office space with large windows.',
    'A cozy bakery with the smell of fresh bread.',
    'A small grocery store packed with goods.',
    'A lively coffee shop with people chatting.',
  ],
  sidewalk: [
    'You are on a busy sidewalk in front of a shop.',
    'A quiet sidewalk lined with trees.',
    'Sidewalk with a bike rack and a bench.',
    'Sidewalk outside a bustling cafe.',
    'Sidewalk with a newspaper stand.',
  ],
}

function getNaturalBlockMap(blockCount: number): string[][] {
  const map: string[][] = []
  for (let y = 0; y < blockCount; y++) {
    map[y] = []
    for (let x = 0; x < blockCount; x++) {
      if (y === 0 || y === blockCount - 1 || x === 0 || x === blockCount - 1) {
        map[y][x] = y === 0 ? 'waterfront' : x === 0 || x === blockCount - 1 ? 'industrial' : 'waterfront'
        continue
      }
      const center = Math.floor(blockCount / 2)
      const dist = Math.max(Math.abs(x - center), Math.abs(y - center))
      if (dist <= 1) {
        map[y][x] = 'downtown'
        continue
      }
      if (dist === 2) {
        map[y][x] = Math.random() < 0.5 ? 'commercial' : 'mixed-use'
        continue
      }
      if (Math.random() < 0.08) {
        map[y][x] = 'park'
        continue
      }
      if (dist === 3 && Math.random() < 0.2) {
        map[y][x] = 'civic'
        continue
      }
      map[y][x] = 'residential'
    }
  }
  for (let y = 1; y < blockCount - 1; y++) {
    for (let x = 1; x < blockCount - 1; x++) {
      if (
        map[y][x] === 'residential' &&
        (map[y - 1][x] === 'park' || map[y + 1][x] === 'park' || map[y][x - 1] === 'park' || map[y][x + 1] === 'park')
      ) {
        if (Math.random() < 0.3) map[y][x] = 'park'
      }
    }
  }
  return map
}

function main() {
  const args = process.argv.slice(2)
  const direction = args[0] as 'top' | 'bottom' | 'left' | 'right'
  if (!direction || !['top', 'bottom', 'left', 'right'].includes(direction)) {
    console.error('Usage: bun expandCity.ts <top|bottom|left|right> [--dummytext]')
    process.exit(1)
  }
  const useDummyText = args.includes('--dummytext')
  const file = 'public/we_made_this_city.csv'
  const text = fs.readFileSync(file, 'utf8')
  const parsed = Papa.parse<Cell>(text, { header: true, dynamicTyping: true })
  const cells = parsed.data.filter((c) => c.x !== undefined) as Cell[]
  const gridSize = Math.max(...cells.map((c) => Math.max(c.x, c.y))) + 1
  const blockSize = 3
  const blockCount = gridSize / blockSize

  const oldMap: string[][] = []
  for (let by = 0; by < blockCount; by++) {
    oldMap[by] = []
    for (let bx = 0; bx < blockCount; bx++) {
      const cell = cells.find((c) => c.x === bx * blockSize + 1 && c.y === by * blockSize + 1)
      oldMap[by][bx] = cell ? cell.biome : 'residential'
    }
  }

  const newCount = blockCount + 1
  const tempMap = getNaturalBlockMap(newCount)
  const newMap: string[][] = []

  if (direction === 'top') {
    newMap[0] = tempMap[0]
    for (let y = 0; y < blockCount; y++) {
      newMap[y + 1] = oldMap[y].slice()
    }
  } else if (direction === 'bottom') {
    for (let y = 0; y < blockCount; y++) {
      newMap[y] = oldMap[y].slice()
    }
    newMap[newCount - 1] = tempMap[newCount - 1]
  } else if (direction === 'left') {
    for (let y = 0; y < blockCount; y++) {
      newMap[y] = [tempMap[y][0], ...oldMap[y]]
    }
  } else if (direction === 'right') {
    for (let y = 0; y < blockCount; y++) {
      newMap[y] = [...oldMap[y], tempMap[y][newCount - 1]]
    }
  }

  const grid: Cell[] = []
  let blockId = 0
  for (let by = 0; by < newCount; by++) {
    for (let bx = 0; bx < newCount; bx++) {
      const biome = newMap[by][bx]
      for (let y = 0; y < blockSize; y++) {
        for (let x = 0; x < blockSize; x++) {
          const gx = bx * blockSize + x
          const gy = by * blockSize + y
          const type = x === 1 && y === 1 ? 'building' : 'sidewalk'
          const walkable = type === 'sidewalk'
          let description: string | undefined
          if (useDummyText) {
            const options = dummyDescriptions[type]
            description = options[Math.floor(Math.random() * options.length)]
          }
          grid.push({ x: gx, y: gy, type, walkable, biome, blockId, description })
        }
      }
      blockId++
    }
  }

  const header = 'x,y,type,walkable,biome,blockId,description'
  const rows = grid.map((c) => [c.x, c.y, c.type, c.walkable, c.biome, c.blockId, JSON.stringify(c.description || '')].join(','))
  fs.writeFileSync(file, [header, ...rows].join('\n'))
  console.log(`Expanded city ${direction}. New size ${newCount * blockSize}x${newCount * blockSize}`)
}

main()
