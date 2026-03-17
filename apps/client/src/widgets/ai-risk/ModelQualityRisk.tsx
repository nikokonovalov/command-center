import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ModelQualityRiskData } from '@command-center/types';
import { Info, ArrowDown, ArrowUp } from 'lucide-react';

export default function ModelQualityRisk({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<ModelQualityRiskData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="flex items-end justify-around flex-1">
                    {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton w-[10%] h-1/2 rounded" />)}
                </div>
            </div>
        );
    }

    const { labels, hallucinationRates, currentRate, rateChange } = data;
    const maxRate = Math.max(...hallucinationRates, 7); // minimum scale is 7
    const isDown = rateChange <= 0;
    const TrendIcon = isDown ? ArrowDown : ArrowUp;

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between mb-4">                <div className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer">
                    All Agents <span className="text-[8px]">▼</span>
                </div>
            </div>

            <div className="flex-1 flex items-stretch justify-between px-2 pt-8 pb-1 relative min-h-0">
                {/* Y-Axis lines (background) */}
                <div className="absolute inset-0 flex flex-col justify-between -z-10 text-[9px] text-gray-400 pb-6 pt-8">
                    {[7, 6, 5, 4, 3, 2, 1, 0].map(v => (
                        <div key={v} className="flex items-center gap-2">
                            <span className="w-2">{v}</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                    ))}
                </div>

                {/* Bars */}
                {hallucinationRates.map((rate, i) => (
                    <div key={i} className="flex flex-col items-center justify-end gap-1 z-10 w-[30px] h-full group">
                        <div className="flex-1 w-full flex items-end justify-center relative">
                            <div
                                className="w-full bg-[#9333ea] rounded-t-sm transition-all duration-500 hover:bg-[#a855f7]"
                                style={{ height: `${(rate / maxRate) * 100}%` }}
                            >
                                <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-gray-800 text-white text-[10px] px-2 py-1 rounded transition-opacity pointer-events-none left-1/2 -translate-x-1/2">
                                    {rate}%
                                </div>
                            </div>
                        </div>
                        <span className="shrink-0 text-[10px] text-gray-500 font-medium h-4">{labels[i]}</span>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex justify-center items-center gap-1.5 text-[10px] text-gray-600">
                <span className="w-3 h-1 bg-[#9333ea] rounded-full" />
                Hallucination
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <Info size={13} className="shrink-0 text-gray-400" />
                Current Hallucination Rate: {currentRate}%
                <span className={`inline-flex items-center ${isDown ? 'text-green-600' : 'text-red-500'}`}>
                    <TrendIcon size={12} className="mx-0.5" />
                    {Math.abs(rateChange)}%
                </span>
                vs last month
            </div>
        </div>
    );
}
