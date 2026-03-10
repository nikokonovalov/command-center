import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { StageTimelineData } from '@command-center/types';
import { FlaskConical, Rocket, CheckCircle2, Info } from 'lucide-react';

const icons: Record<string, React.ElementType> = {
    flask: FlaskConical,
    rocket: Rocket,
    'check-circle': CheckCircle2,
};

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    'On Track': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
    'At SLA Limit': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
    'SLA Breached': { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-200' },
};

export default function StageTimeline({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<StageTimelineData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[70%]" />
                <div className="flex gap-4 flex-1">
                    {[1, 2, 3].map(i => <div key={i} className="skeleton flex-1 rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <p className="text-xs text-gray-500 mb-3">
                Average time spent in each lifecycle stage compared to expected approval timelines.
            </p>

            <div className="grid grid-cols-3 gap-4 flex-1">
                {data.stages.map((stage) => {
                    const Icon = icons[stage.icon] ?? FlaskConical;
                    const style = statusStyles[stage.status] ?? statusStyles['On Track'];

                    return (
                        <div key={stage.label} className={`rounded-xl border ${style.border} ${style.bg} p-4 flex flex-col justify-between`}>
                            <div className="flex items-center gap-2 mb-2">
                                <Icon size={16} className={style.text} />
                                <span className="text-sm font-semibold text-gray-800">{stage.label}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                <div>
                                    <div className="text-gray-400 mb-0.5">Average Duration</div>
                                    <div className="font-semibold text-gray-800">{stage.avgDuration} days</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-gray-400 mb-0.5">Expected SLA</div>
                                    <div className="font-semibold text-gray-800">{stage.expectedSla} days</div>
                                </div>
                            </div>
                            <div className={`inline-flex self-start items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${style.text} ${style.bg} border ${style.border}`}>
                                {stage.status === 'SLA Breached' && '⚠ '}
                                {stage.status === 'At SLA Limit' && '⏱ '}
                                {stage.status === 'On Track' && '✓ '}
                                {stage.status}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <Info size={13} className="shrink-0" />
                {data.summary}
            </div>
        </div>
    );
}
