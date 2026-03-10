import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { TechDistributionData } from '@command-center/types';

export default function TechDistribution({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<TechDistributionData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-3">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="skeleton h-[24px] w-full rounded" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <p className="text-xs text-gray-500 mb-3">
                Breakdown of AI use cases by underlying technology type across the enterprise.
            </p>

            <div className="flex flex-col flex-1 justify-center gap-3">
                {/* Stacked bar */}
                <div className="flex h-[28px] w-full overflow-hidden rounded-lg">
                    {data.segments.map((seg) => (
                        <div
                            key={seg.label}
                            className="flex items-center justify-center text-[11px] font-semibold text-white transition-all duration-500"
                            style={{
                                width: `${seg.percentage}%`,
                                backgroundColor: seg.color,
                            }}
                        >
                            {seg.percentage}%
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4">
                    {data.segments.map((seg) => (
                        <div key={seg.label} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                            <span className="text-xs text-gray-600">
                                {seg.label}: {seg.count.toLocaleString()} ({seg.percentage}%)
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
