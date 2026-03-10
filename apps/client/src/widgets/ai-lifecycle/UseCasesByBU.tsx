import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { UseCasesByBUData } from '@command-center/types';

export default function UseCasesByBU({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<UseCasesByBUData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-2">
                <div className="skeleton h-[14px] w-[60%]" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-[18px] w-full rounded" />
                ))}
            </div>
        );
    }

    const maxCount = Math.max(...data.units.map(u => u.count));

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col justify-center gap-[6px] overflow-y-auto">
                {data.units.map((unit) => (
                    <div key={unit.name} className="flex items-center gap-3">
                        <span className="w-[100px] text-right text-xs text-gray-600 shrink-0 truncate">
                            {unit.name}
                        </span>
                        <div className="flex-1 h-[16px] bg-gray-100 rounded-sm overflow-hidden">
                            <div
                                className="h-full rounded-sm bg-[#2563eb] transition-all duration-500"
                                style={{ width: `${(unit.count / maxCount) * 100}%` }}
                            />
                        </div>
                        <span className="w-[36px] text-xs font-semibold text-gray-700 tabular-nums">
                            {unit.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
