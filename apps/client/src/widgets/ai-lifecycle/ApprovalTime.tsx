import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ApprovalTimeData } from '@command-center/types';
import { ArrowDown, ArrowUp } from 'lucide-react';

export default function ApprovalTime({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<ApprovalTimeData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col justify-center gap-3">
                <div className="skeleton h-[14px] w-[60%]" />
                <div className="skeleton h-[48px] w-[50%]" />
            </div>
        );
    }

    const isDown = data.deltaDirection === 'down';
    const DeltaIcon = isDown ? ArrowDown : ArrowUp;

    // Circle indicator
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(data.avgDays / 30, 1); // assume 30-day max
    const offset = circumference * (1 - progress);

    return (
        <div className="flex h-full flex-col justify-between">
            <div>            </div>
            <div className="flex items-end justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${isDown ? 'text-green-600' : 'text-red-500'}`}>
                            <DeltaIcon size={12} />
                            {data.deltaDays} days {data.deltaLabel}
                        </span>
                    </div>
                    <div className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${data.slaStatus === 'Within SLA' ? 'bg-green-100 text-green-700' :
                            data.slaStatus === 'At SLA Limit' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-600'
                        }`}>
                        Status: {data.slaStatus}
                    </div>
                </div>
                <div className="relative flex h-[80px] w-[80px] items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="5" />
                        <circle
                            cx="40" cy="40" r={radius} fill="none"
                            stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={offset}
                        />
                    </svg>
                    <div className="absolute text-center">
                        <div className="text-xl font-bold text-gray-800">{data.avgDays}</div>
                        <div className="text-[9px] text-gray-400">days</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
