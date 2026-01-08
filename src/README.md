# Motzkin Store (Next.js Frontend)

A Next.js (App Router) frontend for selecting school equipment lists and saving selections into a user cart. The UI is built with TypeScript and Tailwind CSS and integrates with an API Gateway via `NEXT_PUBLIC_API_URL`.

## Quick start

1. Install dependencies
   ```bash
   npm install
   ```
2. Set environment variable
   ```bash
   # .env.local
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
3. Run the dev server
   ```bash
   npm run dev
   ```

> The frontend expects the backend to expose auth + cart endpoints under `${NEXT_PUBLIC_API_URL}/api/...` (see `services/api.ts`).

## Routes

- `/` – Main flow: choose **School** + **Grade**, fetch equipment list, select items/quantities, and save to cart.
- `/login` – Login form.
- `/cart` – View and manage saved cart entries (remove individual entries or clear all).
- `/about` – Static about page.

## Project structure

```
app/        Next.js App Router pages and global layout/styles
components/ Reusable UI components
contexts/   React Context providers (Auth + Cart)
services/   API client (fetch wrappers)
types/      Shared TypeScript types
```

## Authentication & state flow

- `AuthProvider` owns session state (`isAuthenticated`, `userid`, `username`) and exposes `login()` / `logout()` via `useAuth()`.
- `ProtectedRoute` redirects unauthenticated users to `/login` and prevents rendering protected pages.
- `AuthenticatedProviders` conditionally mounts `CartProvider` **only when authenticated**, avoiding cart calls before login.
- `CartProvider` loads and manages cart entries for the current user via `useCart()`.

## File-by-file reference

### `app/`

- `app/layout.tsx` – Root layout: imports `globals.css`, sets metadata, and wraps the app with `AuthProvider` → `AuthenticatedProviders` → `ProtectedRoute`.
- `app/globals.css` – Tailwind import plus light/dark CSS variables and base styling.
- `app/page.tsx` – Main page: fetches schools/grades/equipment from the backend, renders selection UI, and saves chosen items to the cart.
- `app/login/page.tsx` – Login route wrapper; renders the login UI (`LoginForm`) inside `Layout`.
- `app/cart/page.tsx` – Cart UI: lists saved cart entries and uses `ConfirmDialog` for remove/clear actions.
- `app/about/page.tsx` – Informational page.
- `app/favicon.ico` – Site icon.

### `components/`

- `components/Layout.tsx` – Page chrome (Header + Footer + main content).
- `components/Header.tsx` – Top navigation with links and login/logout controls; shows cart state when available.
- `components/Footer.tsx` – Footer content.
- `components/LoginForm.tsx` – Controlled login form; calls `useAuth().login()` and navigates on success, shows errors on failure.
- `components/ProtectedRoute.tsx` – Client-side guard: redirects to `/login` when not authenticated.
- `components/AuthenticatedProviders.tsx` – Wraps children with `CartProvider` only when authenticated.
- `components/SearchableSelect.tsx` – Searchable dropdown component with filtering and blur-delay handling.
- `components/EquipmentList.tsx` – Equipment grid with selectable items and quantity controls (bounded by min/max).
- `components/SaveToCartButton.tsx` – Builds a `CartEntryPayload` from current selections, calls `useCart().addToCart()`, and shows a `Toast` on success/failure.
- `components/ConfirmDialog.tsx` – Reusable modal confirmation dialog (supports danger/default variants; handles Escape key and scroll locking).
- `components/Toast.tsx` – Timed toast notification with optional delay, auto-dismiss, and cleanup on unmount.
- `components/README.md` – Component-library specific notes (focused on UI components).

### `contexts/`

- `contexts/AuthContext.tsx` – Authentication context:
  - `checkAuth()` on mount (falls back to `localStorage` continuity),
  - `login()`/`logout()` methods backed by `services/api.ts`,
  - exports `useAuth()`.
- `contexts/CartContext.tsx` – Cart context:
  - fetch/refresh cart entries for the current user,
  - `addToCart()`, `removeFromCart()`, `clearCart()` helpers,
  - exports `useCart()`.

### `services/`

- `services/api.ts` – Central fetch wrapper for backend calls:
  - Auth: `login`, `logout`, `checkAuth`
  - Catalog: schools/grades/classes/equipment fetchers (as used by `app/page.tsx`)
  - Cart: `getCart`, `addCartEntry`, `removeCartEntry`, `clearCart`
  - Uses `credentials: 'include'` for cookie/session support.

### `types/`

- `types/cart.ts` – Shared types for cart payloads:
  - `CartItem`
  - `CartEntryPayload`

## Backend expectations (contract)

`services/api.ts` assumes an API base URL and paths such as:
- `POST /api/login`
- `POST /api/logout`
- `GET  /api/check-auth`
- `GET  /api/schools`, `GET /api/grades?...`, etc.
- `GET/POST/DELETE` cart endpoints (see `services/api.ts` for exact paths)

If your backend differs, update only `services/api.ts` to keep the rest of the UI stable.
