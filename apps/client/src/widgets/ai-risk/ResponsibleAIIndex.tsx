import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ResponsibleAIIndexData } from '@command-center/types';
import { ShieldCheck, TrendingUp } from 'lucide-react';

export default function ResponsibleAIIndex({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<ResponsibleAIIndexData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-2">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton h-[48px] w-[30%]" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col justify-end">
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-end gap-3">
                        <span className="text-[2.5rem] font-light leading-none text-gray-800">
                            {data.score.toFixed(1)}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100 mb-1">
                            <TrendingUp size={12} />
                            {data.change}% {data.changeLabel}
                        </div>
                    </div>
                </div>

                {/* Decorative mini chart representing "good health" trending up */}
                <div className="h-12 w-20 flex items-end ml-4">
                    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                        <path d="M0,40 Q25,35 50,45 T100,0" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="100" cy="0" r="3.5" fill="#22c55e" />
                        <path d="M0,40 Q25,35 50,45 T100,0 L100,50 L0,50 Z" fill="rgba(34, 197, 94, 0.1)" stroke="none" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
