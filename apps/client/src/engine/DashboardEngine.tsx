import type { DashboardConfig } from '@command-center/types';
import WidgetWrapper from './WidgetWrapper';

interface DashboardEngineProps {
    config: DashboardConfig;
}

/**
 * The Dashboard Engine:
 * 1. Takes a DashboardConfig (from API or static config)
 * 2. Renders a responsive 10-column CSS Grid
 * 3. Iterates widgets and mounts them via WidgetWrapper → WidgetRegistry
 *
 * 10 columns gives maximum flexibility:
 * - 5-card KPI rows → colSpan: 2 each
 * - 2-column layouts → colSpan: 5 each
 * - 3-column layouts → mix of colSpan: 3/4/3
 * - Full width → colSpan: 10
 */
export default function DashboardEngine({ config }: DashboardEngineProps) {
    if (!config.widgets || config.widgets.length === 0) {
        return (
            <div className="flex h-[400px] items-center justify-center text-[0.9rem] text-text-muted">
                No widgets configured for this dashboard.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-10 gap-5 auto-rows-[160px]">
            {config.widgets.map((widget) => (
                <div
                    key={widget.id}
                    style={{
                        gridColumn: `span ${widget.layout.colSpan}`,
                        gridRow: `span ${widget.layout.rowSpan}`,
                        order: widget.layout.order,
                    }}
                >
                    <WidgetWrapper config={widget} />
                </div>
            ))}
        </div>
    );
}
