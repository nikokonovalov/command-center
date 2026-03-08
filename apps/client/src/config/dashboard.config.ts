import type { DashboardConfig } from '@command-center/types';

/**
 * Static fallback dashboard config.
 * Used when the API server is unreachable during development.
 */
export const defaultDashboardConfig: DashboardConfig = {
    id: 'default',
    name: 'Command Center',
    description: 'Default dashboard configuration',
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
