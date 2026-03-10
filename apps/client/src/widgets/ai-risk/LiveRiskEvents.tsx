import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { LiveRiskEventsData } from '@command-center/types';
import { AlertTriangle, TrendingUp, ShieldAlert, Shield, ArrowDown, ArrowUp } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
    'alert-triangle': AlertTriangle,
    'trending-up': TrendingUp,
    'shield-alert': ShieldAlert,
    shield: Shield,
};

export default function LiveRiskEvents({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<LiveRiskEventsData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col">
                <div className="grid grid-cols-4 gap-4 flex-1">
                    {[1, 2, 3, 4].map(i => <div key={i} className="skeleton rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <div className="grid grid-cols-4 gap-4 flex-1">
                {data.events.map((event) => {
                    const Icon = icons[event.icon] ?? AlertTriangle;
                    const isDown = event.trend === 'down';
                    const TrendIcon = isDown ? ArrowDown : ArrowUp;

                    // Hex logic for subtle background color
                    const hexRgb = (hex: string) => {
                        const r = parseInt(hex.slice(1, 3), 16);
                        const g = parseInt(hex.slice(3, 5), 16);
                        const b = parseInt(hex.slice(5, 7), 16);
                        return `${r}, ${g}, ${b}`;
                    };

                    return (
                        <div
                            key={event.label}
                            className="flex flex-col justify-between rounded-xl p-4 border transition-shadow hover:shadow-md"
                            style={{
                                borderColor: `${event.color}40`,
                                backgroundColor: `rgba(${hexRgb(event.color)}, 0.05)`
                            }}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <Icon size={18} style={{ color: event.color }} />
                                <div className={`flex items-center gap-1 text-[10px] font-medium ${isDown ? 'text-green-600' : 'text-red-500'}`}>
                                    <TrendIcon size={10} />
                                    {event.change}% vs last week
                                </div>
                            </div>
                            <div>
                                <div className="text-[2rem] font-semibold leading-none text-gray-800 mb-1">
                                    {event.value.toString().padStart(2, '0')}
                                </div>
                                <div className="text-[13px] font-medium text-gray-700">
                                    {event.label}
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1 leading-tight">
                                    {event.description}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
