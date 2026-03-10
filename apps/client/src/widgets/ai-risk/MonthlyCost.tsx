import { useWidgetSocket } from '@/hooks/useWidgetSocket';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { MonthlyCostData } from '@command-center/types';
import { CircleDollarSign, TrendingUp, TrendingDown } from 'lucide-react';

export default function MonthlyCost({ dataSource }: WidgetProps) {
    const { data, isConnected } = useWidgetSocket<MonthlyCostData>(dataSource);

    if (!data) {
        return (
            <div className="flex h-full flex-col justify-center gap-2">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton h-[48px] w-[40%]" />
                <div className="text-[0.7rem] text-gray-400">
                    {isConnected ? 'Waiting for data...' : 'Connecting...'}
                </div>
            </div>
        );
    }

    const isPositive = data.change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className="flex h-full flex-col justify-between">
            <div>
                <div className="flex items-center gap-1.5 text-gray-700">
                    <CircleDollarSign size={16} />
                    <span className="text-[14px] font-semibold">Monthly AI Cost</span>
                </div>            </div>

            <div className="flex items-end justify-between">
                <div className="flex items-end gap-3 z-10 w-full">
                    <span className="text-[2.5rem] font-light leading-none text-gray-800 tabular-nums tracking-tight">
                        {data.formattedCost}
                    </span>
                    <div className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded mb-1 bg-white
                        ${isPositive ? 'text-red-500' : 'text-green-600'}`}>
                        <TrendIcon size={12} />
                        {isPositive ? '+' : ''}{data.change}% <span className="text-red-400">{data.changeLabel}</span>
                    </div>
                </div>

                {/* Decorative Cost Growth SVG */}
                <div className="absolute right-[18px] bottom-[18px] h-16 w-24">
                    <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible">
                        <defs>
                            <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(239, 68, 68, 0.3)" />
                                <stop offset="100%" stopColor="rgba(239, 68, 68, 0)" />
                            </linearGradient>
                        </defs>
                        <path d="M0,50 Q40,55 70,30 T100,5" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />

                        {/* Shaded Area */}
                        <path d="M0,50 Q40,55 70,30 T100,5 L100,60 L0,60 Z" fill="url(#costGradient)" stroke="none" />

                        {/* Scatter Points */}
                        <circle cx="20" cy="50" r="2.5" fill="#ef4444" />
                        <circle cx="50" cy="44" r="2.5" fill="#ef4444" stroke="white" strokeWidth="1" />
                        <circle cx="75" cy="22" r="2.5" fill="#ef4444" stroke="white" strokeWidth="1" />

                        {/* Highlight End Point */}
                        <circle cx="100" cy="5" r="5" fill="#ef4444" opacity="0.2" />
                        <circle cx="100" cy="5" r="3" fill="#ef4444" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
