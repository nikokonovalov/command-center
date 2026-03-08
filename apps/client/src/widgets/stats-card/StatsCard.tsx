import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { StatsCardData } from '@command-center/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ dataSource }: WidgetProps) {
    // Server returns a single StatsCardData when ?index=N is provided,
    // or an array when no index is specified.
    const { data, isLoading } = useWidgetQuery<StatsCardData | StatsCardData[]>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton h-[36px] w-[70%]" />
                <div className="skeleton h-[12px] w-[40%]" />
            </div>
        );
    }

    const stat: StatsCardData = Array.isArray(data) ? data[0] : data;
    if (!stat) return null;

    const isPositive = (stat.change ?? 0) >= 0;

    return (
        <div className="flex h-full flex-col justify-center gap-2">
            <p className="text-[0.75rem] font-medium uppercase tracking-wider text-text-muted">
                {stat.label}
            </p>
            <div className="text-[2rem] font-extrabold leading-none tracking-tight text-text-primary">
                {stat.value}
            </div>
            {stat.change !== undefined && (
                <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-[2px] text-[0.8rem] font-semibold ${isPositive ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-rose/10 text-accent-rose'}`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isPositive ? '+' : ''}{stat.change}%
                    </span>
                    {stat.changeLabel && (
                        <span className="text-[0.7rem] text-text-muted">{stat.changeLabel}</span>
                    )}
                </div>
            )}
        </div>
    );
}
