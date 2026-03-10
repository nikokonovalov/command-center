import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { LifecycleKpiData } from '@command-center/types';
import { Cpu, FlaskConical, Rocket, CheckCircle2, Archive } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
    cpu: Cpu,
    flask: FlaskConical,
    rocket: Rocket,
    'check-circle': CheckCircle2,
    archive: Archive,
};

export default function LifecycleKpi({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<LifecycleKpiData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="grid h-full grid-cols-5 gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="grid h-full grid-cols-5 gap-4">
            {data.cards.map((card) => {
                const Icon = icons[card.icon] ?? Cpu;
                const isDark = card.variant === 'dark';

                return (
                    <div
                        key={card.label}
                        className={`flex flex-col justify-between rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md ${isDark
                                ? 'bg-[#00112c] text-white'
                                : 'border border-gray-200 bg-[#f8f9fa] text-gray-800'
                            }`}
                    >
                        <div className={isDark ? 'text-gray-300' : 'text-gray-500'}>
                            <Icon size={18} />
                        </div>
                        <div>
                            <div className={`text-4xl font-semibold mb-1 ${isDark ? '' : 'text-[#0052cc]'}`}>
                                {card.value.toLocaleString()}
                            </div>
                            <div className={`text-[15px] font-medium ${isDark ? 'text-white' : 'text-gray-700'}`}>
                                {card.label}
                            </div>
                            <div className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {card.percentage}% of the portfolio
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
