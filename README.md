# Tabletop Scorekeeper

A Progressive Web App shell for board game scorekeepers. **Ticket to Ride** is the first game module.

## Structure

```
src/
  shell/           # Library home, routing chrome
  shared/lib/      # id + namespaced storage
  games/
    registry.ts    # Register new games here
    ticket-to-ride/
```

## Develop

```bash
npm install
npm run dev
```

On Windows PowerShell if scripts are blocked, use `npm.cmd` instead of `npm`.

## Build

```bash
npm run build
npm run preview
```

## Stack

React · React Router · Vite · TypeScript · Tailwind CSS · vite-plugin-pwa
