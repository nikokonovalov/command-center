import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { AttentionQueueData } from '@command-center/types';
import { AlertCircle, User, Clock, ArrowRight } from 'lucide-react';

const severityStyles: Record<string, { bg: string; text: string }> = {
    critical: { bg: 'bg-red-50', text: 'text-red-600' },
    high: { bg: 'bg-orange-50', text: 'text-orange-600' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-600' },
};

export default function AttentionQueue({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<AttentionQueueData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex h-full flex-col gap-3">
                <div className="skeleton flex-1 w-full rounded-xl" />
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <p className="text-xs text-gray-500 mb-4">
                Prioritized queue of AI incidents, drift alerts, and policy violations requiring immediate investigation.
            </p>

            <div className="flex flex-col gap-3 overflow-y-auto pr-2 flex-1">
                {data.items.map((item, idx: number) => {
                    const sevStyle = severityStyles[item.severity] || severityStyles.medium;

                    return (
                        <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-white hover:border-gray-300 transition-colors">
                            <div className="flex items-start gap-4 flex-1">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 ${sevStyle.bg} ${sevStyle.text}`}>
                                    <AlertCircle size={16} />
                                </div>
                                <div className="flex flex-col gap-1 w-full">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-gray-800">{item.name}</span>
                                            <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded capitalize">
                                                {item.alertType}
                                            </span>
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${sevStyle.text} ${sevStyle.bg}`}>
                                                {item.severity}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 mt-1 text-[11px] text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <User size={12} />
                                            {item.owner}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {item.detectedTime}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="ml-4 shrink-0 flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#2563eb] bg-[#eff6ff] rounded hover:bg-[#dbeafe] transition-colors">
                                Investigate
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    );
                })}
            </div>
            {/* View All */}
            <button className="w-full mt-3 py-2 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                View All {data.items.length} Items
            </button>
        </div>
    );
}
