import { useWidgetSocket } from '@/hooks/useWidgetSocket';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { LiveUsersData } from '@command-center/types';
import { Globe, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const trendConfig = {
    up: { icon: TrendingUp, colorClass: 'text-accent-emerald', label: 'Trending up' },
    down: { icon: TrendingDown, colorClass: 'text-accent-rose', label: 'Trending down' },
    stable: { icon: Minus, colorClass: 'text-text-muted', label: 'Stable' },
};

export default function LiveUsers({ dataSource }: WidgetProps) {
    const { data, isConnected } = useWidgetSocket<LiveUsersData>(dataSource);

    if (!data) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-text-muted">
                <div className="skeleton h-[48px] w-[80px] rounded-xl" />
                <p className="text-[0.75rem]">
                    {isConnected ? 'Waiting for data...' : 'Connecting...'}
                </p>
            </div>
        );
    }

    const trend = trendConfig[data.trend];
    const TrendIcon = trend.icon;

    return (
        <div className="flex h-full flex-col items-center justify-center gap-4">
            {/* Big count */}
            <div className="text-center">
                <div className="bg-gradient-to-br from-accent-emerald to-accent-sky bg-clip-text text-[3.5rem] font-black leading-none tracking-tight text-transparent">
                    {data.count.toLocaleString()}
                </div>
                <div className={`mt-2 flex items-center justify-center gap-1 text-[0.75rem] font-medium ${trend.colorClass}`}>
                    <TrendIcon size={14} />
                    {trend.label}
                </div>
            </div>

            {/* Top locations */}
            {data.locations && data.locations.length > 0 && (
                <div className="w-full max-w-[200px]">
                    <div className="mb-2 flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-text-muted">
                        <Globe size={10} />
                        Top Locations
                    </div>
                    {data.locations.slice(0, 3).map((loc) => (
                        <div key={loc.country} className="flex items-center justify-between py-1 text-[0.72rem] text-text-secondary">
                            <span>{loc.country}</span>
                            <span className="font-semibold text-text-primary">{loc.count}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
