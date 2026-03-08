import { useWidgetSocket } from '@/hooks/useWidgetSocket';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { ActivityFeedData } from '@command-center/types';

function getInitials(name: string): string {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function timeAgo(isoString: string): string {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function ActivityFeed({ dataSource }: WidgetProps) {
    const { data } = useWidgetSocket<ActivityFeedData>(dataSource);

    if (!data) {
        return (
            <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <div className="skeleton h-[36px] w-[36px] shrink-0 rounded-[10px]" />
                        <div className="flex flex-1 flex-col gap-1.5">
                            <div className="skeleton h-[12px] w-[80%]" />
                            <div className="skeleton h-[10px] w-[30%]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
            {data.map((item) => (
                <div key={item.id} className="flex items-start gap-3 border-b border-border-subtle py-3 last:border-b-0">
                    <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent-indigo to-accent-violet text-[0.75rem] font-bold text-white">
                        {getInitials(item.user)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[0.8rem] leading-snug text-text-secondary">
                            <strong className="font-semibold text-text-primary">{item.user}</strong> {item.action} <strong className="font-semibold text-text-primary">{item.target}</strong>
                        </p>
                        <p className="mt-1 text-[0.7rem] text-text-muted">{timeAgo(item.timestamp)}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
