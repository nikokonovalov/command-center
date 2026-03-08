import { useQuery } from '@tanstack/react-query';
import type { DashboardConfig, ApiResponse } from '@command-center/types';
import DashboardEngine from '@/engine/DashboardEngine';
import { defaultDashboardConfig } from '@/config/dashboard.config';

export default function DashboardPage() {
    const { data: config, isLoading, error } = useQuery<DashboardConfig>({
        queryKey: ['dashboard-config'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/config');
            if (!res.ok) throw new Error('Failed to load dashboard config');
            const json: ApiResponse<DashboardConfig> = await res.json();
            return json.data;
        },
        staleTime: Infinity, // Config rarely changes
    });

    // Fallback to static config if API is unreachable
    const dashboardConfig = config ?? (error ? defaultDashboardConfig : undefined);

    if (isLoading && !dashboardConfig) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-text-muted">
                <div className="text-center">
                    <div className="skeleton mx-auto mb-4 h-[24px] w-[200px]" />
                    <div className="skeleton mx-auto h-[14px] w-[300px]" />
                </div>
            </div>
        );
    }

    if (!dashboardConfig) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-[0.9rem] text-accent-rose">
                Failed to load dashboard configuration.
            </div>
        );
    }

    return <DashboardEngine config={dashboardConfig} />;
}
