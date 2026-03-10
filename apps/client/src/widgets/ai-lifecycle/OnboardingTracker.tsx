import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { OnboardingTrackerData } from '@command-center/types';

export default function OnboardingTracker({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<OnboardingTrackerData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="skeleton flex-1 w-full rounded-lg" />
            </div>
        );
    }

    // Donut chart calculations
    const total = data.totalPending;
    const cx = 80;
    const cy = 80;
    const r = 60;
    const innerR = 40;

    let cumulativeAngle = -90; // Start from top

    const arcs = data.categories.map((cat) => {
        const angle = (cat.count / total) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + angle;
        cumulativeAngle = endAngle;

        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        const outerX1 = cx + r * Math.cos(startRad);
        const outerY1 = cy + r * Math.sin(startRad);
        const outerX2 = cx + r * Math.cos(endRad);
        const outerY2 = cy + r * Math.sin(endRad);
        const innerX1 = cx + innerR * Math.cos(endRad);
        const innerY1 = cy + innerR * Math.sin(endRad);
        const innerX2 = cx + innerR * Math.cos(startRad);
        const innerY2 = cy + innerR * Math.sin(startRad);

        const largeArc = angle > 180 ? 1 : 0;

        const d = [
            `M${outerX1},${outerY1}`,
            `A${r},${r} 0 ${largeArc} 1 ${outerX2},${outerY2}`,
            `L${innerX1},${innerY1}`,
            `A${innerR},${innerR} 0 ${largeArc} 0 ${innerX2},${innerY2}`,
            'Z',
        ].join(' ');

        return { d, color: cat.color };
    });

    return (
        <div className="flex h-full flex-col">
            <p className="text-xs text-gray-500 mb-4">
                AI use cases progressing through the required onboarding and approval workflow.
            </p>

            <div className="flex flex-1 items-center gap-6">
                {/* Legend */}
                <div className="flex flex-col gap-2 min-w-[140px]">
                    {data.categories.map((cat) => (
                        <div key={cat.label} className="flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                            <span className="text-xs text-gray-600">{cat.label}: {cat.count}</span>
                        </div>
                    ))}
                </div>

                {/* Donut */}
                <div className="relative flex items-center justify-center">
                    <svg width={160} height={160} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
                        {arcs.map((arc, i) => (
                            <path key={i} d={arc.d} fill={arc.color} />
                        ))}
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-xs text-gray-400">Total AI Use Cases</div>
                        <div className="text-xl font-bold text-gray-800">{total}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
