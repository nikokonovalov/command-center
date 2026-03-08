import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { RevenueChartData } from '@command-center/types';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function RevenueChart({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<RevenueChartData>(dataSource);

    if (isLoading || !data) {
        return <div className="skeleton h-full w-full" />;
    }

    // Transform data for Recharts
    const chartData = data.labels.map((label, i) => ({
        name: label,
        ...Object.fromEntries(data.datasets.map((ds) => [ds.label, ds.data[i]])),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <defs>
                    {data.datasets.map((ds) => (
                        <linearGradient key={ds.label} id={`gradient-${ds.label}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ds.color ?? '#6366f1'} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ds.color ?? '#6366f1'} stopOpacity={0} />
                        </linearGradient>
                    ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={{ stroke: 'var(--color-border-subtle)' }}
                    tickLine={false}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                    contentStyle={{
                        background: 'var(--color-bg-elevated)',
                        border: '1px solid var(--color-border)',
                        borderRadius: 10,
                        fontSize: '0.8rem',
                        color: 'var(--color-text-primary)',
                    }}
                    labelStyle={{ color: 'var(--color-text-secondary)', marginBottom: 4 }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                />
                <Legend
                    wrapperStyle={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}
                />
                {data.datasets.map((ds) => (
                    <Area
                        key={ds.label}
                        type="monotone"
                        dataKey={ds.label}
                        stroke={ds.color ?? '#6366f1'}
                        strokeWidth={2}
                        fill={`url(#gradient-${ds.label})`}
                    />
                ))}
            </AreaChart>
        </ResponsiveContainer>
    );
}
