import { useNavigate } from 'react-router-dom';
import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { LifecycleFunnelData } from '@command-center/types';
import { buildUseCasesUrl } from '@/lib/navigation';
import { Info } from 'lucide-react';

export default function LifecycleFunnel({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<LifecycleFunnelData>(dataSource);
    const navigate = useNavigate();

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[70%]" />
                <div className="skeleton flex-1 w-full" />
            </div>
        );
    }

    const stageLabels = ['Total\nAI Use Cases', ...data.stages.map(s => s.label)];
    const stageFilterValues: (string | null)[] = [null, ...data.stages.map(s => s.label)];
    const layerColors = ['#003b70', '#0052cc', '#0077cc', '#27a4db'];
    const funnelWidths = [100, 70, 50, 35];

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 items-center gap-6">
                {/* Funnel SVG */}
                <div className="flex-1 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="h-full w-full max-h-[180px]">
                        {funnelWidths.map((width, i) => {
                            const y = i * 48 + 5;
                            const h = 42;
                            const x = (200 - width * 1.8) / 2;
                            const w = width * 1.8;
                            const nextW = funnelWidths[i + 1] ? funnelWidths[i + 1] * 1.8 : w * 0.6;
                            const nextX = (200 - nextW) / 2;
                            const filterValue = stageFilterValues[i];

                            return (
                                <g
                                    key={i}
                                    className="cursor-pointer"
                                    onClick={() => navigate(buildUseCasesUrl(filterValue ? { lifecycleStage: filterValue } : {}))}
                                >
                                    <path
                                        d={`M${x},${y} L${x + w},${y} L${nextX + nextW},${y + h} L${nextX},${y + h} Z`}
                                        fill={layerColors[i]}
                                        opacity={0.9}
                                        className="transition-opacity hover:opacity-100"
                                    />
                                    <text
                                        x={100}
                                        y={y + h / 2 + 4}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="9"
                                        fontWeight="600"
                                    >
                                        {stageLabels[i].split('\n').map((line, li) => (
                                            <tspan key={li} x={100} dy={li === 0 ? 0 : 11}>
                                                {line}
                                            </tspan>
                                        ))}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                {/* Conversion Rates */}
                <div className="flex flex-col gap-3 min-w-[140px]">
                    {data.stages.map((stage) => (
                        <div
                            key={stage.label}
                            className="flex flex-col cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => navigate(buildUseCasesUrl({ lifecycleStage: stage.label }))}
                        >
                            <div className="text-2xl font-bold text-gray-800">{stage.transitionRate}%</div>
                            <div className="text-xs text-gray-500">Transition Rate to {stage.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <Info size={13} className="shrink-0" />
                {data.productionTransitionRate}% AI Use Cases are to production transition
            </div>
        </div>
    );
}
