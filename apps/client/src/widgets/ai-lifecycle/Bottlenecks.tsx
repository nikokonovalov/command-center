import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { BottlenecksData } from '@command-center/types';
import { AlertTriangle } from 'lucide-react';

export default function Bottlenecks({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<BottlenecksData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                {[1, 2, 3].map(i => <div key={i} className="skeleton h-[48px] w-full rounded-lg" />)}
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-col gap-3 flex-1">
                {data.items.map((item) => (
                    <div
                        key={item.label}
                        className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={16} className="mt-0.5 text-yellow-500 shrink-0" />
                            <div>
                                <div className="text-sm font-semibold text-gray-800">{item.label}</div>
                                <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-green-600 tabular-nums ml-4">
                            {item.count.toString().padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
