# Project Guidelines

## Commit Messages
- Begin with a concise summary line using sentence case.
- Follow the summary with a blank line and a more detailed description when needed.
- Mention the main files or modules changed.

## Code Style
- Use **2 spaces** for indentation in TypeScript and JavaScript files.
- Strings should use **double quotes**.
- Always end files with a newline.
- Prefer `const` for values that never change and `let` for those that do.
- Keep lines under 120 characters.

## Repository Layout
- `generateCity.ts` generates CSV city grids. Use `bun run generate <blocks>` to run it.
- Place generated `city_*.csv` files in the `public/` folder so the viewer can load them.
- React components live in `components/` and Next.js pages in `app/`.
- A quick OpenAI test script lives at `test-openai.ts`.

## Workflow
- Start the development server with `bun run dev`.
- Before committing, run `bun run build` to ensure the Next.js project compiles.
- If the build fails in this environment, note the failure in your PR message.

