import { useQuery } from '@tanstack/react-query';
import type { TableConfig, AIUseCaseItem, ApiResponse } from '@command-center/types';
import UseCasesTable from '@/components/use-cases/UseCasesTable';
import { defaultUseCasesTableConfig } from '@/config/dashboard.config';

export default function UseCasesPage() {
    const {
        data: config,
        isLoading: configLoading,
        error: configError,
    } = useQuery<TableConfig>({
        queryKey: ['table-config-use-cases'],
        queryFn: async () => {
            const res = await fetch('/api/dashboard/config?tab=use-cases');
            if (!res.ok) throw new Error('Failed to load table config');
            const json: ApiResponse<TableConfig> = await res.json();
            return json.data;
        },
        staleTime: import.meta.env.DEV ? 0 : 24 * 60 * 60 * 1000,
    });

    const {
        data: items,
        isLoading: dataLoading,
        error: dataError,
    } = useQuery<AIUseCaseItem[]>({
        queryKey: ['inventory'],
        queryFn: async () => {
            const res = await fetch('/api/inventory');
            if (!res.ok) throw new Error('Failed to load inventory data');
            const json: ApiResponse<AIUseCaseItem[]> = await res.json();
            return json.data;
        },
        staleTime: 30_000,
    });

    // Fallback to static config if API is unreachable
    const tableConfig = config ?? (configError ? defaultUseCasesTableConfig : undefined);

    if ((configLoading || dataLoading) && (!tableConfig || !items)) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-text-muted">
                <div className="text-center">
                    <div className="skeleton mx-auto mb-4 h-[24px] w-[200px]" />
                    <div className="skeleton mx-auto h-[14px] w-[300px]" />
                </div>
            </div>
        );
    }

    if (!tableConfig || (!items && dataError)) {
        return (
            <div className="flex h-[60vh] items-center justify-center text-[0.9rem] text-accent-rose">
                Failed to load use cases data.
            </div>
        );
    }

    return <UseCasesTable config={tableConfig} data={items ?? []} />;
}
