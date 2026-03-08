import { lazy, type ComponentType } from 'react';
import type { WidgetDataSource } from '@command-center/types';

/**
 * Props every widget component receives.
 * Widgets are "dumb" — they get a dataSource config and render accordingly.
 */
export interface WidgetProps {
    dataSource: WidgetDataSource;
}

/**
 * The Widget Registry maps widget type strings (from the dashboard config)
 * to lazily-loaded React components.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  TO ADD A NEW WIDGET:                                           │
 * │  1. Create your widget in src/widgets/your-widget/              │
 * │  2. Add ONE line to this registry                               │
 * │  That's it! The engine handles everything else.                 │
 * └──────────────────────────────────────────────────────────────────┘
 */
export const WidgetRegistry: Record<string, React.LazyExoticComponent<ComponentType<WidgetProps>>> = {
    'stats-card': lazy(() => import('@/widgets/stats-card')),
    'revenue-chart': lazy(() => import('@/widgets/revenue-chart')),
    'live-users': lazy(() => import('@/widgets/live-users')),
    'activity-feed': lazy(() => import('@/widgets/activity-feed')),
    'data-table': lazy(() => import('@/widgets/data-table')),
    'performance-chart': lazy(() => import('@/widgets/performance-chart')),
};
