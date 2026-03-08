import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { WidgetDataSource, ApiResponse } from '@command-center/types';

/**
 * Generic hook for widgets that fetch data via REST.
 * Wraps TanStack Query with widget-specific defaults from the data source config.
 *
 * Usage:
 *   const { data, isLoading, error } = useWidgetQuery<RevenueChartData>(dataSource);
 */
export function useWidgetQuery<T>(dataSource: WidgetDataSource): UseQueryResult<T> {
    return useQuery<T>({
        queryKey: ['widget', dataSource.endpoint],
        queryFn: async () => {
            const res = await fetch(dataSource.endpoint!);
            if (!res.ok) throw new Error(`Widget fetch failed: ${res.statusText}`);
            const json: ApiResponse<T> = await res.json();
            return json.data;
        },
        refetchInterval: dataSource.refreshInterval || false,
        staleTime: dataSource.staleTime ?? 30_000,
        enabled: !!dataSource.endpoint,
    });
}
