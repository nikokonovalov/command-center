// ─── Dashboard Configuration ─────────────────────────────────────────────────

export interface DashboardConfig {
    id: string;
    name: string;
    description?: string;
    widgets: WidgetConfig[];
}

export interface WidgetConfig {
    id: string;
    type: string;
    title: string;
    description?: string;
    layout: WidgetLayout;
    dataSource: WidgetDataSource;
}

export interface WidgetLayout {
    /** CSS Grid column span (1–4) */
    colSpan: number;
    /** CSS Grid row span */
    rowSpan: number;
    /** Explicit ordering (lower = first). Optional — defaults to array index. */
    order?: number;
}

export interface WidgetDataSource {
    /** Determines which hook the widget uses */
    type: 'rest' | 'socket' | 'static';

    // ── REST config ──
    /** REST endpoint path, e.g. "/api/widgets/revenue" */
    endpoint?: string;
    /** Auto-refetch interval in ms (0 or undefined = disabled) */
    refreshInterval?: number;
    /** TanStack Query stale time in ms */
    staleTime?: number;

    // ── Socket config ──
    /** Socket.io event name to subscribe to */
    socketEvent?: string;
}
