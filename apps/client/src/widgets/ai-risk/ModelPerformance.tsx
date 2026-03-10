import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ModelPerformanceData } from '@command-center/types';
import { Info } from 'lucide-react';

export default function ModelPerformance({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<ModelPerformanceData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[50%]" />
                <div className="skeleton flex-1 w-full" />
            </div>
        );
    }

    const { labels, accuracy, latency } = data;

    // SVG Dimensions
    const w = 400;
    const h = 180;
    const paddingX = 20;
    const paddingY = 20;
    const usableW = w - paddingX * 2;
    const usableH = h - paddingY * 2;

    // Scales
    const minAcc = 70;
    const maxAcc = 105;
    const rangeAcc = maxAcc - minAcc;

    const minLat = 100;
    const maxLat = 500;
    const rangeLat = maxLat - minLat;

    // Path generators
    const getPoints = (dataset: number[], min: number, range: number) => {
        return dataset.map((v, i) => {
            const x = paddingX + (i / (dataset.length - 1)) * usableW;
            const y = paddingY + usableH - ((v - min) / range) * usableH;
            return `${x},${y}`;
        });
    };

    const accPoints = getPoints(accuracy, minAcc, rangeAcc);
    const latPoints = getPoints(latency, minLat, rangeLat);

    // Smooth Bezier curve generator
    const getCurve = (points: string[]) => {
        const coords = points.map(p => p.split(',').map(Number));
        if (coords.length === 0) return '';
        let path = `M${coords[0][0]},${coords[0][1]}`;
        for (let i = 0; i < coords.length - 1; i++) {
            const cx = (coords[i][0] + coords[i + 1][0]) / 2;
            path += ` C${cx},${coords[i][1]} ${cx},${coords[i + 1][1]} ${coords[i + 1][0]},${coords[i + 1][1]}`;
        }
        return path;
    };

    const accPath = getCurve(accPoints);
    const latPath = getCurve(latPoints);

    return (
        <div className="flex h-full flex-col">
            <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-500">Operational performance trends: Accuracy & Latency gains.</p>
                <div className="bg-gray-100 px-2 py-1 rounded text-[10px] text-gray-500 flex items-center gap-1 cursor-pointer">
                    All Agents <span className="text-[8px]">▼</span>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center">
                {/* Y-Axis Labels (Left - Accuracy) */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-400">
                    {[105, 100, 95, 90, 85, 80, 75, 70].map(v => <span key={v}>{v}</span>)}
                </div>

                {/* SVG Chart */}
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(i => {
                        const y = paddingY + (i / 7) * usableH;
                        return <line key={i} x1={paddingX} y1={y} x2={w - paddingX} y2={y} stroke="#f3f4f6" strokeWidth="1" />;
                    })}

                    {/* Lines */}
                    <path d={accPath} fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                    <path d={latPath} fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" />

                    {/* Points */}
                    {accPoints.map((p, i) => {
                        const [x, y] = p.split(',');
                        return <circle key={`acc-${i}`} cx={x} cy={y} r="3" fill="#a855f7" />;
                    })}
                    {latPoints.map((p, i) => {
                        const [x, y] = p.split(',');
                        return <circle key={`lat-${i}`} cx={x} cy={y} r="3" fill="#14b8a6" />;
                    })}
                </svg>

                {/* Y-Axis Labels (Right - Latency) */}
                <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-[9px] text-gray-400 text-right">
                    {[500, 400, 350, 300, 250, 200, 150, 100].map(v => <span key={v}>{v}</span>)}
                </div>

                {/* X-Axis Labels */}
                <div className="absolute bottom-0 left-[20px] right-[20px] flex justify-between text-[10px] text-gray-500">
                    {labels.map(L => <span key={L}>{L}</span>)}
                </div>

                {/* Legend */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <span className="w-3 h-1 bg-[#a855f7] rounded-full" />
                        Accuracy (%)
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-600">
                        <span className="w-3 h-1 bg-[#14b8a6] rounded-full" />
                        Latency (ms)
                    </div>
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                <Info size={13} className="shrink-0 text-gray-400" />
                Accuracy: {data.currentAccuracy}% ↑{data.accuracyChange}% | Latency: {data.currentLatency} ms ↓{data.latencyChange} ms
            </div>
        </div>
    );
}
