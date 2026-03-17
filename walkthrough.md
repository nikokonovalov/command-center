# Command Center — Architecture Walkthrough

## Monorepo Structure

```
command-center/                    ← TurboRepo root
├── apps/
│   ├── client/                    ← React (Vite) frontend
│   └── server/                    ← Express + Socket.io backend
│       └── src/mocks/
│           ├── inventory.ts       ← 110 AI Use Case items (centralized mock DB)
│           └── generators.ts      ← 20 generator functions (derive from inventory)
├── packages/
│   ├── types/                     ← Shared TypeScript types (@command-center/types)
│   │   └── src/inventory.ts       ← AIUseCaseItem interface + union types
│   └── tsconfig/                  ← Shared TS config
├── turbo.json
└── pnpm-workspace.yaml
```

The `@command-center/types` package is the **single source of truth** for data shapes — both the server (mock generators) and client (hooks, widgets) import from it.

---

## How Everything is Connected — The Full Stack

```mermaid
graph TB
    subgraph Server ["Backend (Express + Socket.io)"]
        S_Index["index.ts — Server Entry"]
        S_Routes["routes/widgets.ts"]
        S_Sockets["sockets/widget-events.ts"]
        S_Inventory["mocks/inventory.ts — 110 AI Use Cases"]
        S_Mocks["mocks/generators.ts — 20 Generators"]
        S_Index --> S_Routes
        S_Index --> S_Sockets
        S_Routes --> S_Mocks
        S_Sockets --> S_Mocks
        S_Inventory --> S_Mocks
    end

    subgraph Client ["Frontend (React + Vite)"]
        C_Main["main.tsx — App Entry"]
        C_App["App.tsx — Providers + Router"]
        C_Layout["DashboardLayout — Sidebar + Top Bar + Outlet"]
        C_Page["DashboardPage — Fetches Config"]
        C_Engine["DashboardEngine — CSS Grid from Config"]
        C_Wrapper["WidgetWrapper — Card Chrome + Error Boundary + Suspense"]
        C_Registry["WidgetRegistry — Lazy Component Lookup"]
        C_Widget["Widget Component — Renders Data"]
        C_Main --> C_App
        C_App --> C_Layout
        C_Layout --> C_Page
        C_Page --> C_Engine
        C_Engine --> C_Wrapper
        C_Wrapper --> C_Registry
        C_Registry --> C_Widget
    end

    S_Routes -- "GET /api/dashboard/config" --> C_Page
    S_Routes -- "GET /api/widgets/:type/data" --> C_Widget
    S_Sockets -- "Socket.io events" --> C_Widget
```

---

## Data Flow — Step by Step

### 1. App Bootstrap

[main.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/main.tsx) renders `<App />` into the DOM.

[App.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/App.tsx) wraps the app in three layers:

| Layer | File | Purpose |
|-------|------|---------|
| **QueryProvider** | [QueryProvider.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/providers/QueryProvider.tsx) | TanStack Query client (30s stale time, 2 retries) |
| **SocketProvider** | [SocketProvider.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/providers/SocketProvider.tsx) | Global Socket.io singleton → React context |
| **BrowserRouter** | react-router-dom | Route: `/` redirects → `/dashboard` |

### 2. Layout Shell

[DashboardLayout.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/layouts/DashboardLayout.tsx) renders the **fixed sidebar** (nav links) and **top bar** (title + notification bell), with an `<Outlet />` where page content is injected.

### 3. Dashboard Config Fetching

[DashboardPage.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/pages/DashboardPage.tsx) is the key orchestrator. On mount it:

1. Calls `GET /api/dashboard/config` via TanStack Query (`staleTime: Infinity`)
2. Server responds with a [DashboardConfig](file:///Users/nikokonovalov/Git/command-center/packages/types/src/dashboard.ts) — an array of [WidgetConfig](file:///Users/nikokonovalov/Git/command-center/packages/types/src/dashboard.ts#10-17) objects
3. If the API is unreachable, falls back to the static [dashboard.config.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/config/dashboard.config.ts)
4. Passes the resolved config to `<DashboardEngine />`

> [!IMPORTANT]
> The dashboard layout is **server-driven**. The backend decides *which* widgets appear, their *order*, *grid spans*, and *data sources*. The frontend just renders whatever config it receives.

### 4. Engine — Config-Driven Rendering

[DashboardEngine.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/engine/DashboardEngine.tsx) reads `config.widgets` and renders a **CSS Grid** (`grid-cols-4, auto-rows-[180px]`). For each widget config, it creates a grid cell with the correct `colSpan`/`rowSpan` and mounts a `<WidgetWrapper />`.

### 5. WidgetWrapper — The "Chrome" Layer

[WidgetWrapper.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/engine/WidgetWrapper.tsx) wraps every widget in:
- **Card UI** — rounded border, title header, "Live" indicator for socket widgets
- **`<Suspense>`** — shows a skeleton while the lazy component loads
- **`<WidgetErrorBoundary>`** — catches crashes, shows a Retry button

It looks up the widget's React component from the **WidgetRegistry**.

### 6. WidgetRegistry — The Type→Component Map

[WidgetRegistry.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/engine/WidgetRegistry.ts) maps the `type` string from the config (e.g. `"stats-card"`) to a **lazily-loaded** React component:

```typescript
'stats-card':  lazy(() => import('@/widgets/stats-card')),
'live-users':  lazy(() => import('@/widgets/live-users')),
// ...etc
```

### 7. Widget Components — "Dumb" Renderers

Each widget receives a `dataSource` prop and uses one of two hooks to get data:

| Data Source Type | Hook | File |
|-----------------|------|------|
| `rest` | `useWidgetQuery<T>()` | [useWidgetQuery.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/hooks/useWidgetQuery.ts) — wraps TanStack Query |
| `socket` | `useWidgetSocket<T>()` | [useWidgetSocket.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/hooks/useWidgetSocket.ts) — subscribes to a Socket.io room |

**REST example** — [StatsCard.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/widgets/stats-card/StatsCard.tsx):
```typescript
const { data, isLoading } = useWidgetQuery<StatsCardData>(dataSource);
// Renders the stat value, change %, trend icon
```

**Socket example** — [LiveUsers.tsx](file:///Users/nikokonovalov/Git/command-center/apps/client/src/widgets/live-users/LiveUsers.tsx):
```typescript
const { data, isConnected } = useWidgetSocket<LiveUsersData>(dataSource);
// Renders live count, trend, top locations
```

---

## Inventory — The Centralized Data Layer

All widget data is derived from a single **inventory** of 110 AI use case entities in [mocks/inventory.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/mocks/inventory.ts). This array mimics a future database — each object is an `AIUseCaseItem` (typed in [packages/types/src/inventory.ts](file:///Users/nikokonovalov/Git/command-center/packages/types/src/inventory.ts)).

```
inventory (110 items)
  │
  ├── generators.ts reads inventory
  │     ├── generateLifecycleKpiData()   → counts items per stage
  │     ├── generateUseCasesByBUData()   → groups by LOB
  │     ├── generateAttentionQueueData() → filters items with active alerts
  │     └── ...18 more generators
  │
  └── routes/widgets.ts calls generators via widgetDataMap
```

**Distribution (approximate):**

| Dimension | Breakdown |
|-----------|-----------|
| Lifecycle Stages | POC ~48, Pilot ~27, Production ~22, Archived ~18 |
| AI Technology | Agentic AI ~41, GenAI ~69 |
| Approval Status | Approved ~93, Pending ~9, Rejected ~8 |
| LOBs | All 10 BUs (Compliance, COO, Finance, Service Ops, Internal Audit, HR, Client, Risk, Services, Technology, GLAC) |
| Active | ~45 items (Production + some Pilot) |
| With Agents | ~22 Production items with deployed agent names, drift scores, model metrics |
| With Alerts | ~7 items with active attention-queue alerts |

Each item carries fields for both the table view (third tab) and widget derivation — `businessCaseId`, `useCaseId`, `useCaseName`, `lob`, `lifecycleStage`, `slaStatus`, `severity`, `status`, `aiTechnology`, plus risk/model metrics for active items.

> [!NOTE]
> Time-series widgets (model-performance, model-quality-risk, ai-index-trend) keep historical data points as static arrays but derive the **current/latest value** from inventory averages. This is a pragmatic compromise until time-series data is added to the inventory.

---

## Backend Data Sources

### REST — [widgets.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/routes/widgets.ts)

All widget endpoints follow the pattern `GET /api/widgets/:type/data` and are routed through a single `widgetDataMap` lookup. Each generator in [mocks/generators.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/mocks/generators.ts) derives its data from the inventory.

| Endpoint | Generator | Derivation |
|----------|-----------|------------|
| `GET /api/dashboard/config?tab=lifecycle\|risk` | hardcoded configs | Returns [DashboardConfig](file:///Users/nikokonovalov/Git/command-center/packages/types/src/dashboard.ts) per tab |
| **AI Lifecycle widgets** | | |
| `/api/widgets/lifecycle-kpi/data` | `generateLifecycleKpiData()` | Counts items per `lifecycleStage` |
| `/api/widgets/approval-time/data` | `generateApprovalTimeData()` | Averages `approvalDays` across all items |
| `/api/widgets/lifecycle-funnel/data` | `generateLifecycleFunnelData()` | Computes stage transition rates from counts |
| `/api/widgets/stage-timeline/data` | `generateStageTimelineData()` | Averages `daysInCurrentStage` per stage vs SLA |
| `/api/widgets/bottlenecks/data` | `generateBottlenecksData()` | Counts SLA breaches, high-risk pending, stuck >30 days |
| `/api/widgets/onboarding-tracker/data` | `generateOnboardingTrackerData()` | Counts pending items by CISO/CBDC/MRM/NAC |
| `/api/widgets/use-cases-by-bu/data` | `generateUseCasesByBUData()` | Groups and counts by `lob` |
| `/api/widgets/approval-status/data` | `generateApprovalStatusData()` | Percentages by `status` |
| `/api/widgets/tech-distribution/data` | `generateTechDistributionData()` | Percentages by `aiTechnology` |
| **AI Risk widgets** | | |
| `/api/widgets/risk-stats/data?index=0\|1` | `generateRiskStatsData()` | Counts active items / items with agents |
| `/api/widgets/live-risk-events/data` | `generateLiveRiskEventsData()` | Sums alerts, violations, triggers from active items |
| `/api/widgets/responsible-ai-index/data` | `generateResponsibleAIIndexData()` | Averages `responsibleAIScore` of active items |
| `/api/widgets/model-performance/data` | `generateModelPerformanceData()` | Averages `accuracy`/`latency` from agent items |
| `/api/widgets/model-quality-risk/data` | `generateModelQualityRiskData()` | Averages `hallucinationRate` from agent items |
| `/api/widgets/ai-index-trend/data` | `generateAIIndexTrendData()` | Derives current score from avg `responsibleAIScore` |
| `/api/widgets/attention-queue/data` | `generateAttentionQueueData()` | Filters items with non-null `alertType` |
| `/api/widgets/behavioral-drift/data` | `generateBehavioralDriftData()` | Filters items with agents, returns drift data |
| `/api/widgets/risk-score-breakdown/data` | `generateRiskScoreBreakdownData()` | Returns risk component breakdown per agent |

### Socket.io — [widget-events.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/sockets/widget-events.ts)

| Event/Room | Interval | Generator | Derivation |
|-----------|----------|-----------|------------|
| `production-growth-update` | 3s | `generateProductionGrowthData()` | Counts Production items, adds random sparkline jitter |
| `monthly-cost-update` | 5s | `generateMonthlyCostData()` | Sums `monthlyCost` of active items, adds jitter |

Clients subscribe by emitting `subscribe` with a `{ room }` payload. The server uses Socket.io rooms to only push data to interested clients.

---

## Widget File Structure

```
widgets/
├── stats-card/
│   ├── StatsCard.tsx    ← Component (default export)
│   └── index.ts         ← Barrel: export { default } from './StatsCard'
├── live-users/
│   ├── LiveUsers.tsx
│   └── index.ts
├── revenue-chart/
│   ├── ...
│   └── index.ts
├── ai-lifecycle/        ← Multi-component group (no index.ts)
│   ├── DashboardHeader.tsx
│   ├── KpiCardRow.tsx
│   └── ...
```

The [index.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/index.ts) barrel file is what makes `import('@/widgets/stats-card')` work in the WidgetRegistry's `lazy()` calls.

---

## How to Build a New Widget

> [!TIP]
> You only touch **3 files** (+ your new widget). The engine handles everything else.

### Step 1: Define the data type

In [packages/types/src/widgets.ts](file:///Users/nikokonovalov/Git/command-center/packages/types/src/widgets.ts), add your data shape:

```typescript
export interface MyWidgetData {
    title: string;
    value: number;
}
```

Re-export it from [packages/types/src/index.ts](file:///Users/nikokonovalov/Git/command-center/packages/types/src/index.ts) if needed.

### Step 2: Create the widget component

Create `src/widgets/my-widget/MyWidget.tsx`:

```typescript
import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { MyWidgetData } from '@command-center/types';

export default function MyWidget({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<MyWidgetData>(dataSource);
    if (isLoading || !data) return <div className="skeleton h-full w-full" />;
    return <div>{data.title}: {data.value}</div>;
}
```

Create `src/widgets/my-widget/index.ts`:
```typescript
export { default } from './MyWidget';
```

### Step 3: Register the widget

In [WidgetRegistry.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/engine/WidgetRegistry.ts), add one line:

```typescript
'my-widget': lazy(() => import('@/widgets/my-widget')),
```

### Step 4: Add to the dashboard config

In the server's [widgets.ts](file:///Users/nikokonovalov/Git/command-center/apps/server/src/routes/widgets.ts), add a new entry to the `dashboardConfig.widgets` array:

```typescript
{
    id: 'my-widget',
    type: 'my-widget',         // Must match the key in WidgetRegistry
    title: 'My Widget',
    layout: { colSpan: 2, rowSpan: 1 },
    dataSource: { type: 'rest', endpoint: '/api/widgets/my-widget/data' },
},
```

And add a mock data generator + endpoint for it.

### Step 5 (optional): Update the static fallback

Mirror the same entry in [dashboard.config.ts](file:///Users/nikokonovalov/Git/command-center/apps/client/src/config/dashboard.config.ts) for offline dev.

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Server-driven config** | Dashboard layout can change without deploying the frontend |
| **Widget Registry + lazy()** | Code-splitting — widgets only load when needed |
| **Error Boundary per widget** | One widget crashing doesn't take down the whole dashboard |
| **Dual data hooks** | Widgets don't care *how* data arrives (REST vs Socket) — they just call the appropriate hook |
| **Shared types package** | Single source of truth prevents API contract drift between client and server |
| **Static fallback config** | Frontend works even when the backend is down during development |
| **Centralized inventory** | All 20 generators derive from a single 110-item array — ensures cross-widget data consistency and prepares for the future "All AI Use Cases" table tab |
| **Inventory → Generator derivation** | Generators compute (count, average, filter, group) from inventory at call time — no hardcoded values, so adding/removing items automatically updates all widgets |
