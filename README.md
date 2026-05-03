# Product Dashboard

A polished React + Vite product dashboard built for fast editing, clean presentation, and robust state handling.

## Features

- Responsive product catalog with search, category filtering, and sort controls
- Inline category editing with optimistic save and conflict-safe updates
- Undo / redo history for product category changes
- Live periodic product update simulation for pricing and ratings
- Toggle between pagination and infinite scrolling views
- Clean, premium UI with a soft palette, refined spacing, and subtle motion
- Loading and status indicators for user clarity

## Project Structure

- `src/App.jsx` — app entry, provider setup, initial fetch, live update timer
- `src/layout/DashboardLayout.jsx` — main page layout with sidebar and header
- `src/components/ProductTable.jsx` — table view, search/filter/sort, edit flow, mode toggle
- `src/components/UndoRedo.jsx` — undo/redo controls and action status
- `src/context/ProductContext.jsx` — global state, reducer, history, optimistic update handling
- `src/hooks/usePagination.js` — pagination helper with boundary clamping
- `src/hooks/useInfiniteScroll.js` — infinite scroll auto-loading hook
- `src/api/productApi.js` — product fetch/save APIs
- `src/utils/simulateApi.js` — simulated network latency and failure behavior
- `src/index.css` — complete layout and premium UI styling

## Approach

### State and data flow

The dashboard uses a React context and reducer to manage the product list, pending updates, live update state, and undo/redo history.

- `SET_PRODUCTS`, `SET_LOADING`, and `SET_ERROR` manage initial data loading
- `UPDATE_CATEGORY_OPTIMISTIC` applies UI-first edits immediately
- `UPDATE_CATEGORY_SUCCESS` confirms saves, while `UPDATE_CATEGORY_FAILURE` reverts the product on failure
- `LIVE_UPDATE` updates pricing and rating without interrupting pending edits
- `UNDO` / `REDO` restore previous product states cleanly

### User experience

The goal was to make the interface feel premium without over-engineering:

- kept layout simple with a sidebar, header, and main content area
- used subtle gradients and minimal shadows for a modern surface look
- kept controls compact and clearly grouped
- used a soft teal-indigo accent palette for professionalism and calm focus

### Editing workflow

Inline category edits are handled with a draft input state and a save commit on blur or Enter.

- Draft values are tracked locally for a clean edit experience
- Updates are sent through `saveProductCategory()` and resolved in the global reducer
- Pending saves show clear status badges and error states if a save fails

### Performance and UX

- `useMemo` ensures filtering and sorting only recalculate when needed
- custom hooks keep pagination and infinite scrolling independent and reusable
- sticky table headers and a scrollable table container keep the product list easy to scan

## Running the project

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Build and preview

```bash
npm run build
npm run preview
```

## Deployment

This app can be deployed to any static hosting provider that supports Vite builds, such as Netlify, Vercel, or GitHub Pages. After building, deploy the `dist` folder and ensure the host is configured to serve `index.html` for client-side routing.

## Notes

This repository is intentionally focused on user-facing polish and product workflow quality. The implementation balances modern UI refinement with practical React state management.
