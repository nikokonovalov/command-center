import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { RiskStatsData } from '@command-center/types';
import { Cpu, Bot, TrendingUp, TrendingDown } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
    cpu: Cpu,
    bot: Bot,
};

export default function RiskStats({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<RiskStatsData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton h-[48px] w-[70%]" />
                <div className="skeleton h-[12px] w-[40%]" />
            </div>
        );
    }

    const Icon = icons[data.icon] ?? Cpu;
    const isPositive = data.change >= 0;
    const TrendIcon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className="flex h-full flex-col justify-between bg-[#00112c] text-white p-6 rounded-2xl">
            <div className="flex items-start justify-between">
                <Icon size={32} strokeWidth={1.5} className="text-gray-300" />
                <div className={`flex items-center gap-1.5 text-xs font-medium tracking-wide ${isPositive ? 'text-[#10b981]' : 'text-red-400'}`}>
                    <TrendIcon size={14} />
                    {isPositive ? '+' : ''}{data.change}% {data.changeLabel}
                </div>
            </div>

            <div className="mt-auto">
                <div className="text-[4rem] font-bold leading-none tracking-tight mb-2">
                    {data.value}
                </div>
                <div className="text-[17px] font-medium text-white/95 tracking-wide">
                    {data.label}
                </div>
                {/* Specific subtitles based on the mock */}
                {data.icon === 'cpu' && (
                    <div className="text-[11px] text-gray-400 mt-1.5">Total Use Cases Deployed and Running.</div>
                )}
                {data.icon === 'bot' && (
                    <div className="text-[11px] text-gray-400 mt-1.5">Total Active Agent Workflows</div>
                )}
            </div>
        </div>
    );
}
