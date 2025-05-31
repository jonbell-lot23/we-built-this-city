# We Built This City 🏙️

A city grid generator and visualizer using OpenAI and Next.js.

## Setup

1. Install dependencies:
```bash
bun install
```

2. Set your OpenAI API key:
```bash
export OPENAI_API_KEY="your_key_here"
```

## Usage

1. Generate a city grid:
```bash
bun run generate 10  # Creates a 10x10 grid
```

This creates a CSV file like `city_10x10.csv` in the project root.

2. Move the CSV to the public folder:
```bash
mv city_*.csv public/
```

3. Start the visualization server:
```bash
bun run dev
```

4. Open http://localhost:3000 and select your city grid from the dropdown.

## Features

- Hover over cells to see descriptions
- Natural urban flow between biomes
- Color-coded biome types
- Responsive grid visualization

## Biome Types

- 🟩 Residential (green)
- 🟦 Commercial (blue)
- 🟫 Park (dark green)
- ⬛ Downtown (gray)
- 🟧 Industrial (orange)
- 🟦 Waterfront (cyan)
- 🟪 Mixed-use (purple)
- 🟥 Civic (red)