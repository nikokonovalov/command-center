import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { BehavioralDriftData } from '@command-center/types';

export default function BehavioralDrift({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<BehavioralDriftData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton flex-1 w-full rounded" />
            </div>
        );
    }

    const { agents } = data;
    const maxScore = Math.max(...agents.map(a => a.score), 100);

    const getBarColor = (status: string) => {
        switch (status) {
            case 'High Risk': return '#ef4444'; // red
            case 'Watch': return '#f59e0b'; // amber
            default: return '#10b981'; // green
        }
    };

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col justify-center gap-4 overflow-y-auto pr-2 min-h-0">
                {agents.map((agent) => (
                    <div key={agent.name} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-gray-800">{agent.name}</span>
                            <span className="font-semibold text-gray-600">{agent.score.toFixed(1)}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${(agent.score / maxScore) * 100}%`,
                                    backgroundColor: getBarColor(agent.category)
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-5 text-[10px] text-gray-500 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" /> Stable
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#f59e0b]" /> Watch
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ef4444]" /> High Risk
                </div>
            </div>
        </div>
    );
}
