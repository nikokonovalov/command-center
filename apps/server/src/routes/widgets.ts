import { Router } from 'express';
import type { DashboardConfig, ApiResponse } from '@command-center/types';
import {
    generateRevenueData,
    generateStatsData,
    generateLiveUsersData,
    generateActivityFeedData,
    generateDataTableData,
    generatePerformanceData,
} from '../mocks/generators.js';

const router = Router();

// ─── Dashboard Config ────────────────────────────────────────────────────────

const dashboardConfig: DashboardConfig = {
    id: 'main-dashboard',
    name: 'Command Center',
    description: 'Real-time operations dashboard',
    widgets: [
        {
            id: 'stats-revenue',
            type: 'stats-card',
            title: 'Total Revenue',
            layout: { colSpan: 1, rowSpan: 1 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/stats/data?index=0', staleTime: 30000 },
        },
        {
            id: 'stats-users',
            type: 'stats-card',
            title: 'Active Users',
            layout: { colSpan: 1, rowSpan: 1 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/stats/data?index=1', staleTime: 30000 },
        },
        {
            id: 'stats-conversion',
            type: 'stats-card',
            title: 'Conversion Rate',
            layout: { colSpan: 1, rowSpan: 1 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/stats/data?index=2', staleTime: 30000 },
        },
        {
            id: 'stats-aov',
            type: 'stats-card',
            title: 'Avg. Order Value',
            layout: { colSpan: 1, rowSpan: 1 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/stats/data?index=3', staleTime: 30000 },
        },
        {
            id: 'revenue-chart',
            type: 'revenue-chart',
            title: 'Revenue Overview',
            layout: { colSpan: 3, rowSpan: 2 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/revenue/data', staleTime: 60000 },
        },
        {
            id: 'live-users',
            type: 'live-users',
            title: 'Live Users',
            layout: { colSpan: 1, rowSpan: 2 },
            dataSource: { type: 'socket', socketEvent: 'live-users-update' },
        },
        {
            id: 'activity-feed',
            type: 'activity-feed',
            title: 'Recent Activity',
            layout: { colSpan: 2, rowSpan: 2 },
            dataSource: { type: 'socket', socketEvent: 'activity-update' },
        },
        {
            id: 'performance-chart',
            type: 'performance-chart',
            title: 'System Performance',
            layout: { colSpan: 2, rowSpan: 2 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/performance/data', refreshInterval: 10000 },
        },
        {
            id: 'data-table',
            type: 'data-table',
            title: 'Top Products',
            layout: { colSpan: 4, rowSpan: 2 },
            dataSource: { type: 'rest', endpoint: '/api/widgets/table/data', staleTime: 60000 },
        },
    ],
};

router.get('/api/dashboard/config', (_req, res) => {
    const response: ApiResponse<DashboardConfig> = {
        data: dashboardConfig,
        meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
});

// ─── Widget Data Endpoints ───────────────────────────────────────────────────

const widgetDataMap: Record<string, () => unknown> = {
    revenue: generateRevenueData,
    stats: generateStatsData,
    table: generateDataTableData,
    performance: generatePerformanceData,
    'activity-feed': generateActivityFeedData,
    'live-users': generateLiveUsersData,
};

router.get('/api/widgets/:type/data', (req, res) => {
    const generator = widgetDataMap[req.params.type];
    if (!generator) {
        res.status(404).json({ code: 'WIDGET_NOT_FOUND', message: `Unknown widget type: ${req.params.type}` });
        return;
    }

    let result = generator();

    // Support ?index=N for array responses (e.g., stats cards)
    const indexParam = req.query.index;
    if (indexParam !== undefined && Array.isArray(result)) {
        const idx = parseInt(indexParam as string, 10);
        result = result[idx] ?? result[0];
    }

    const response: ApiResponse<unknown> = {
        data: result,
        meta: { timestamp: new Date().toISOString() },
    };
    res.json(response);
});

export default router;
