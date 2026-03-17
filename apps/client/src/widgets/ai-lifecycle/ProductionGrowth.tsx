import { useNavigate } from 'react-router-dom';
import { useWidgetSocket } from '@/hooks/useWidgetSocket';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ProductionGrowthData } from '@command-center/types';
import { buildUseCasesUrl } from '@/lib/navigation';

export default function ProductionGrowth({ dataSource }: WidgetProps) {
    const { data, isConnected } = useWidgetSocket<ProductionGrowthData>(dataSource);
    const navigate = useNavigate();

    if (!data) {
        return (
            <div className="flex h-full flex-col justify-center gap-2">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="skeleton h-[36px] w-[40%]" />
                <div className="text-[0.7rem] text-gray-400">
                    {isConnected ? 'Waiting for data...' : 'Connecting...'}
                </div>
            </div>
        );
    }

    // Build sparkline path
    const points = data.sparkline;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const w = 100;
    const h = 40;
    const pathPoints = points.map((v, i) => {
        const x = (i / (points.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return `${x},${y}`;
    });
    const linePath = `M${pathPoints.join(' L')}`;
    const areaPath = `${linePath} L${w},${h} L0,${h} Z`;

    return (
        <div
            className="flex h-full flex-col justify-between cursor-pointer"
            onClick={() => navigate(buildUseCasesUrl({ lifecycleStage: 'Production' }))}
        >
            <div>            </div>
            <div className="flex items-end justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-light text-gray-800">+{data.growthPercent}%</span>
                    <div className="flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                        {data.previousCount} → {data.currentCount}
                    </div>
                </div>
                <div className="h-12 w-16">
                    <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible">
                        <path d={areaPath} fill="rgba(34, 197, 94, 0.1)" stroke="none" />
                        <path d={linePath} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx={w} cy={h - ((points[points.length - 1] - min) / range) * h} r="3.5" fill="#22c55e" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
