import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { AIIndexTrendData } from '@command-center/types';
import { Info } from 'lucide-react';

export default function AIIndexTrend({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<AIIndexTrendData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[70%]" />
                <div className="skeleton flex-1 w-full" />
            </div>
        );
    }

    const { labels, values, currentScore, change, highlightPoint } = data;

    // SVG scaling
    const w = 400;
    const h = 180;
    const paddingX = 20;
    const paddingY = 30; // Extra top padding for tooltip
    const usableW = w - paddingX * 2;
    const usableH = h - paddingY * 2;

    const minVal = 65;
    const maxVal = 105;
    const range = maxVal - minVal;

    // Line path
    const points = values.map((v, i) => {
        const x = paddingX + (i / (values.length - 1)) * usableW;
        const y = paddingY + usableH - ((v - minVal) / range) * usableH;
        return { x, y, v };
    });

    const pathD = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;
    const areaD = `${pathD} L${w - paddingX},${h - paddingY} L${paddingX},${h - paddingY} Z`;

    const highlight = points[highlightPoint.index];

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-500">
                    Unified Enterprise/Agent AI health and risk score.
                </p>
                <div className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer">
                    All Enterprise <span className="text-[8px]">▼</span>
                </div>
            </div>

            <div className="flex-1 relative">
                {/* Y-Axis lines */}
                <div className="absolute inset-0 flex flex-col justify-between -z-10 text-[9px] text-gray-400">
                    {[105, 100, 95, 90, 85, 80, 75, 70, 65].map(v => (
                        <div key={v} className="flex items-center gap-2">
                            <span className="w-4 text-right">{v}</span>
                            <div className="flex-1 h-px bg-gray-100" />
                        </div>
                    ))}
                </div>

                {/* X-Axis labels */}
                <div className="absolute bottom-0 left-[36px] right-0 flex justify-between text-[10px] text-gray-500 font-medium">
                    {labels.map((L, i) => (
                        // slightly adjusted positions to align with grid
                        <span key={L} style={{ marginLeft: i === 0 ? 0 : '-10px' }}>{L}</span>
                    ))}
                </div>

                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full absolute inset-0 pl-6" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                            <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                        </linearGradient>
                    </defs>
                    <path d={areaD} fill="url(#trendGradient)" stroke="none" />
                    <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#3b82f6" strokeWidth="2" />
                    ))}

                    {/* Highlight Tooltip */}
                    {highlight && (
                        <g transform={`translate(${highlight.x}, ${highlight.y - 12})`}>
                            <rect x="-30" y="-30" width="60" height="26" rx="4" fill="#1f2937" />
                            <polygon points="-4,-4 4,-4 0,0" fill="#1f2937" />
                            <text x="0" y="-20" textAnchor="middle" fill="#9ca3af" fontSize="9" fontWeight="600">{labels[highlightPoint.index]}</text>
                            <text x="0" y="-10" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">{highlightPoint.value.toFixed(1)}</text>
                            <circle cx="0" cy="12" r="5" fill="#3b82f6" opacity="0.3" />
                            <circle cx="0" cy="12" r="3" fill="#3b82f6" />
                        </g>
                    )}
                </svg>
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <Info size={13} className="shrink-0 text-gray-400" />
                Current Enterprise Trust Index: {currentScore.toFixed(1)}
                <span className="text-green-600 font-medium"> (+{change}% vs last month)</span>
            </div>
        </div>
    );
}
