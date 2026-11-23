# Vantage CRM

A premium enterprise CRM management system — frontend only, built with React 19, Vite, Tailwind CSS v4, React Router v7, Recharts and Lucide icons. All data lives in your browser's LocalStorage. Light, enterprise-style default theme (white surfaces, hairline borders) with a refined dark mode — flat, no gradients.

## Quick start

```bash
npm.cmd install     # or: npm install
npm.cmd run dev     # http://localhost:5173
npm.cmd run build   # production build → dist/
npm.cmd run preview # serve the production build
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| **Owner** (full company access) | `owner@crm.com` | `Owner123!` |
| Team User | `john@crm.com` | `User123!` |
| Team User | `sara@crm.com` | `User123!` |

The login page shows these credentials and offers one-click demo sign-in.

## Roles

- **Owner** — company-wide dashboard, all customers/leads/deals/tasks, team management (add/edit/activate/deactivate), company reports, activity audit log, company & owner settings, reset demo data.
- **Team User** — personal dashboard with only their assigned records, my tasks (status updates), my leads (status updates), my deals (Kanban drag-and-drop), my customers, personal reports, profile & settings.

Route-level guards (`ProtectedRoute`), component-level guards (`RoleGuard`) and data-layer scoping (`utils/selectors.js`) are combined — UI hiding is never the only barrier.

> ⚠️ **Security note:** This is a frontend-only demonstration. LocalStorage sessions and client-side role checks are NOT production-grade authorization — anyone with DevTools can read or modify stored data. Do not use real data here.

## Architecture

```
src/
  components/{ui,tables,charts,layout,common}  # shared, reusable components
  context/     # ToastContext, CrmContext (store+CRUD+permissions), AuthContext
  data/        # seedData.js — realistic demo dataset (dates are relative to "now")
  features/    # feature-based modules: auth, dashboard, customers, leads, deals,
               #   tasks, team, reports, activities, settings
  hooks/       # useAuth / useCrm re-exports
  layouts →    # components/layout/{OwnerLayout,UserLayout} with Sidebar + Navbar
  routes/      # ProtectedRoute (route-level RBAC)
  services/    # storage.js — LocalStorage persistence + seed bootstrap
  utils/       # format.js, selectors.js (role scoping + chart datasets), exporters.js
```

Persistence keys live under `vantage-crm::*` in LocalStorage. Settings → Account & Demo → **Reset Demo Data** restores the original seed.

## Features

Customers CRUD with drawer detail & CSV export · Leads with inline status pipeline · Kanban deals board with native drag-and-drop · Task assignment, overdue tracking and productivity scoring · Activity log with categories · Live-computed dashboards (Recharts area/bar/line/donut) · Global scoped search · Live notification bell (overdue/due-soon/closing-soon) · **Theme changer**: 4 dark + 3 light full themes ( Midnight, Deep Ocean, Forest, Ember Night, Porcelain, Mist Blue, Sage), accent gradient overrides, navbar light/dark toggle, density modes · Responsive with mobile drawer sidebar.
