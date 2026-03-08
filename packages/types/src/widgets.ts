// ─── Widget Data Shapes ──────────────────────────────────────────────────────
// Each widget's API response type lives here so both client and server share it.

export interface StatsCardData {
    label: string;
    value: string | number;
    change?: number;          // percentage change (positive = up, negative = down)
    changeLabel?: string;     // e.g. "vs last month"
    icon?: string;            // icon name or key
}

export interface RevenueChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
    }[];
    total: number;
    currency: string;
}

export interface LiveUsersData {
    count: number;
    trend: 'up' | 'down' | 'stable';
    locations?: { country: string; count: number }[];
}

export interface ActivityFeedItem {
    id: string;
    user: string;
    action: string;
    target: string;
    timestamp: string;        // ISO 8601
    avatar?: string;
}

export type ActivityFeedData = ActivityFeedItem[];

export interface DataTableRow {
    [key: string]: string | number | boolean | null;
}

export interface DataTableData {
    columns: { key: string; label: string; sortable?: boolean }[];
    rows: DataTableRow[];
    totalRows: number;
}

export interface PerformanceChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        color?: string;
    }[];
}
