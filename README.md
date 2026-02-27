# Evently — Event Planner Client

A React + TypeScript frontend for managing events, RSVPs, and user accounts, built with a focus on clean architecture, type safety, and a polished UI.

---

## Table of Contents

- [Engineering Decisions](#engineering-decisions)
- [Setup Instructions](#setup-instructions)
- [Assumptions](#assumptions)

---

## Engineering Decisions

### Framework & Tooling

| Choice | Rationale |
|---|---|
| **React 19 + TypeScript** | Industry-standard pairing; TypeScript catches integration bugs at compile time, especially important when consuming a typed REST API. |
| **Vite** | Significantly faster dev server and HMR compared to CRA or webpack. Native ESM support aligns with the project's `"type": "module"` setup. |
| **Tailwind CSS v4** | Utility-first approach keeps styles co-located with components. v4's engine is faster and removes the need for a separate config file. |
| **shadcn/ui** | Unstyled, accessible Radix UI primitives wrapped in Tailwind. Components are copied into the repo (`src/components/ui/`) so they can be freely customised without fighting a library's API. |

### State Management

**Redux Toolkit (RTK)** is used as the single source of truth for all server-derived state (auth, events, RSVPs, tags). Key decisions:

- **`createAsyncThunk`** for every API call — gives consistent `pending / fulfilled / rejected` lifecycle handling and integrates cleanly with Redux DevTools.
- **Slices are domain-scoped** (`authSlice`, `eventsSlice`, `rsvpsSlice`, `tagsSlice`) to keep concerns separated and avoid a monolithic reducer.
- Auth tokens are persisted to `localStorage` and rehydrated in `initialState` so sessions survive page reloads.
- The `tempToken` received during a 2FA login flow is intentionally kept **outside Redux** (in component state + React Router's location state) because it is short-lived and must not outlive the `/verify-2fa` screen.

### API Layer

- All requests go through a single **Axios instance** (`src/api/axios.ts`) which centralises base URL configuration and attaches the `Authorization` header via a request interceptor.
- Each domain has its own API module (`authApi`, `eventsApi`, etc.) that returns typed `AxiosResponse<ApiResponse<T>>` — keeping thunks thin and testable.

### Form Handling & Validation

- **React Hook Form** with **Zod** resolvers provides schema-driven validation with minimal re-renders.
- `createEventSchema` and `editEventSchema` are intentionally separate: the create schema rejects past dates; the edit schema does not, allowing existing past-dated events to be updated without a spurious validation error.

### Authentication & 2FA

- The login thunk inspects the `requires2FA` flag in the response. When `true`, it returns without setting auth state; the component navigates to `/verify-2fa` passing the `tempToken` and original credentials via router location state.
- `/verify-2fa` runs a 10-minute countdown timer. On expiry the user is redirected back to `/login`. Wrong-code errors show inline without redirecting.
- 2FA enable/disable is surfaced on the Profile page rather than a separate settings page, reducing navigation friction.

### Routing

React Router v7 with a nested layout route (`AppLayout`) wraps all authenticated pages, providing a shared sidebar/topbar without duplicating layout code.

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- The [event-planner server](../eventPlanner-server) running locally (default: `http://localhost:5173`)

### Steps

```bash
# 1. Clone the repository
git clone <repo-url>
cd event-planner/eventPlanner-client

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env and set the API base URL:
# VITE_API_BASE_URL=http://localhost:5173

# 4. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173` by default.

### Other Scripts

```bash
npm run build      # Type-check and build for production
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## Assumptions

1. **Backend contract** — The API follows the response envelope `{ success, data, error }` consistently. All thunks extract `data.data` from the Axios response based on this assumption.

2. **Token storage** — Storing `accessToken` and `refreshToken` in `localStorage` is acceptable for this project's security requirements. A production system with stricter security needs would use `httpOnly` cookies.

3. **2FA is email-based** — The verification code is always delivered by email. No TOTP/authenticator-app flow is handled on the frontend.

4. **`tempToken` expiry is 10 minutes** — The countdown timer on `/verify-2fa` is hard-coded to 600 seconds to match the server's session window. If the server value changes, this constant (`SESSION_SECONDS` in `Verify2FAPage.tsx`) must be updated manually.

5. **`two_factor_enabled` is returned by `GET /auth/profile`** — The Profile page reads 2FA status from the Redux `user` object, which is populated on login and profile fetch. If the field is absent from the API response, 2FA is treated as disabled.

6. **Tags are always an array or absent** — The event edit pre-fill guards with `Array.isArray` because tags can be missing from some API responses (e.g. list endpoints), not just `null`.

7. **No offline support** — The app assumes a live network connection. No service worker or caching strategy is in place.

