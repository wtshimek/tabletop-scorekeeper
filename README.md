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

## Live app

- **Production:** https://tabletop-scorekeeper.vercel.app  
- **Source:** https://github.com/wtshimek/tabletop-scorekeeper  

Scores are stored in each browser’s `localStorage` (not synced across devices).

### Deploy updates

After connecting the GitHub repo in the [Vercel project settings](https://vercel.com/wesley-4f2a/tabletop-scorekeeper/settings/git) (Install the Vercel GitHub app if prompted):

```bash
git add -A
git commit -m "Your change"
git push origin main
```

Vercel rebuilds production automatically. Until Git is connected, deploy with:

```bash
npx.cmd vercel --prod
```

## Stack

React · React Router · Vite · TypeScript · Tailwind CSS · vite-plugin-pwa
