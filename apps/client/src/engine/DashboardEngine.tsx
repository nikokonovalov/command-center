import type { DashboardConfig } from '@command-center/types';
import WidgetWrapper from './WidgetWrapper';

interface DashboardEngineProps {
    config: DashboardConfig;
}

/**
 * The Dashboard Engine:
 * 1. Takes a DashboardConfig (from API or static config)
 * 2. Renders a responsive CSS Grid
 * 3. Iterates widgets and mounts them via WidgetWrapper → WidgetRegistry
 *
 * This is the "smart" layer that knows about layout.
 * Widgets themselves are "dumb" — they only know how to render their data.
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
        <div className="grid grid-cols-1 gap-5 auto-rows-[180px] md:grid-cols-2 xl:grid-cols-4">
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
