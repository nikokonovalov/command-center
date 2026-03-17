import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { RiskScoreBreakdownData } from '@command-center/types';

export default function RiskScoreBreakdown({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<RiskScoreBreakdownData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton flex-1 w-full rounded" />
            </div>
        );
    }

    const { agents } = data;

    const factors = [
        { key: 'criticalAlerts', label: 'Critical Alerts', color: '#ef4444' },
        { key: 'drift', label: 'Drift', color: '#f59e0b' },
        { key: 'policyViolations', label: 'Policy Violations', color: '#8b5cf6' },
        { key: 'guardrailTriggers', label: 'Guardrail Triggers', color: '#0ea5e9' }
    ] as const;

    return (
        <div className="flex h-full flex-col">
            <div className="flex-1 flex flex-col justify-center gap-4 overflow-y-auto">
                {agents.map((agent) => {
                    const totalScore = agent.criticalAlerts + agent.drift + agent.policyViolations + agent.guardrailTriggers;

                    return (
                        <div key={agent.name} className="flex items-center gap-4">
                            <span className="w-[120px] text-xs font-semibold text-gray-800 shrink-0 truncate text-right">
                                {agent.name}
                            </span>

                            {/* Stacked Bar */}
                            <div className="flex-1 h-4 flex rounded-sm overflow-hidden bg-gray-50">
                                {factors.map((factor) => {
                                    const score = agent[factor.key] || 0;
                                    const percent = totalScore > 0 ? (score / totalScore) * 100 : 0;
                                    if (percent === 0) return null;

                                    return (
                                        <div
                                            key={factor.key}
                                            className="h-full transition-all duration-300 group relative border-r border-white/20 last:border-r-0"
                                            style={{ width: `${percent}%`, backgroundColor: factor.color }}
                                        >
                                            {/* Tooltip */}
                                            <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10 transition-opacity">
                                                {factor.label}: {score}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <span className="w-[30px] font-bold text-gray-800 text-sm tabular-nums">
                                {totalScore}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] text-gray-600 border-t border-gray-100 pt-3">
                {factors.map((factor) => (
                    <div key={factor.key} className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: factor.color }} />
                        {factor.label}
                    </div>
                ))}
            </div>
        </div>
    );
}
