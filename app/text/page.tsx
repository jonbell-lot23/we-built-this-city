'use client'

import { useState, useEffect } from 'react'
import Papa from 'papaparse'

interface Cell {
  x: number
  y: number
  type: string
  walkable: boolean
  biome: string
  blockId: number
  description: string
}

const FILE = 'we_made_this_city.csv'

export default function TextAdventure() {
  const [cells, setCells] = useState<Cell[]>([])
  const [gridSize, setGridSize] = useState(0)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    fetch(`/${FILE}`)
      .then(res => res.text())
      .then(text => {
        Papa.parse<Cell>(text, {
          header: true,
          dynamicTyping: true,
          complete: results => {
            const data = results.data as Cell[]
            setCells(data)
            const size = Math.max(...data.map(c => Math.max(c.x, c.y))) + 1
            setGridSize(size)
            const start = data.find(c => c.walkable)
            if (start) setPos({ x: start.x, y: start.y })
          },
        })
      })
      .catch(err => console.error('Error loading CSV:', err))
  }, [])

  const getCell = (x: number, y: number) => cells.find(c => c.x === x && c.y === y)

  const move = (dx: number, dy: number) => {
    const nx = pos.x + dx
    const ny = pos.y + dy
    if (nx < 0 || ny < 0 || nx >= gridSize || ny >= gridSize) return
    const dest = getCell(nx, ny)
    if (dest && dest.walkable) {
      setPos({ x: nx, y: ny })
    }
  }

  const cell = getCell(pos.x, pos.y)

  return (
    <main className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">City Text Adventure</h1>
        <div className="bg-white rounded shadow p-4 mb-4 min-h-[120px]">
          <p className="mb-2">{cell?.description || 'You see nothing special.'}</p>
          <p className="text-sm text-gray-500">({pos.x}, {pos.y}) {cell?.biome}</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button className="py-2 bg-blue-500 text-white rounded" onClick={() => move(0, -1)}>
            N
          </button>
          <div></div>
          <button className="py-2 bg-blue-500 text-white rounded" onClick={() => move(-1, 0)}>
            W
          </button>
          <div></div>
          <button className="py-2 bg-blue-500 text-white rounded" onClick={() => move(1, 0)}>
            E
          </button>
          <div></div>
          <button className="py-2 bg-blue-500 text-white rounded" onClick={() => move(0, 1)}>
            S
          </button>
          <div></div>
        </div>
      </div>
    </main>
  )
}
