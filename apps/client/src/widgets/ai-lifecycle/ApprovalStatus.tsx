import { useNavigate } from 'react-router-dom';
import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ApprovalStatusData } from '@command-center/types';
import { buildUseCasesUrl } from '@/lib/navigation';

export default function ApprovalStatus({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<ApprovalStatusData>(dataSource);
    const navigate = useNavigate();

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-3">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="skeleton h-[80px] w-[80px] rounded-full mx-auto" />
            </div>
        );
    }

    const total = data.approved + data.rejected + data.pending;
    const segments = [
        { label: 'Approved', value: data.approved, color: '#0077cc' },
        { label: 'Rejected', value: data.rejected, color: '#8b5cf6' },
        { label: 'Pending', value: data.pending, color: '#64748b' },
    ];

    // Donut arcs
    const cx = 50;
    const cy = 50;
    const r = 38;
    const innerR = 26;
    let cumAngle = -90;

    const arcs = segments.map((seg) => {
        const angle = (seg.value / total) * 360;
        const start = cumAngle;
        const end = cumAngle + angle;
        cumAngle = end;

        const startRad = (start * Math.PI) / 180;
        const endRad = (end * Math.PI) / 180;
        const large = angle > 180 ? 1 : 0;

        const d = [
            `M${cx + r * Math.cos(startRad)},${cy + r * Math.sin(startRad)}`,
            `A${r},${r} 0 ${large} 1 ${cx + r * Math.cos(endRad)},${cy + r * Math.sin(endRad)}`,
            `L${cx + innerR * Math.cos(endRad)},${cy + innerR * Math.sin(endRad)}`,
            `A${innerR},${innerR} 0 ${large} 0 ${cx + innerR * Math.cos(startRad)},${cy + innerR * Math.sin(startRad)}`,
            'Z',
        ].join(' ');
        return { ...seg, d };
    });

    return (
        <div className="flex h-full flex-col">
            <div className="flex flex-1 items-center gap-4">
                <div className="flex flex-col gap-1.5 min-w-[100px]">
                    {segments.map(s => (
                        <div
                            key={s.label}
                            className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                            onClick={() => navigate(buildUseCasesUrl({ status: s.label }))}
                        >
                            <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                            <span className="text-[11px] text-gray-600">{s.label}: {s.value}%</span>
                        </div>
                    ))}
                </div>
                <div className="relative flex items-center justify-center">
                    <svg width={100} height={100} viewBox="0 0 100 100">
                        {arcs.map((arc, i) => (
                            <path
                                key={i}
                                d={arc.d}
                                fill={arc.color}
                                className="cursor-pointer transition-opacity hover:opacity-80"
                                onClick={() => navigate(buildUseCasesUrl({ status: arc.label }))}
                            />
                        ))}
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-lg font-bold text-gray-800">100%</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
