import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { PerformanceChartData } from '@command-center/types';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

export default function PerformanceChart({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<PerformanceChartData>(dataSource);

    if (isLoading || !data) {
        return <div className="skeleton h-full w-full" />;
    }

    // Transform for Recharts
    const chartData = data.labels.map((label, i) => ({
        name: label,
        ...Object.fromEntries(data.datasets.map((ds) => [ds.label, ds.data[i]])),
    }));

    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" />
                <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }}
                    axisLine={{ stroke: 'var(--color-border-subtle)' }}
                    tickLine={false}
                    interval={3}
                />
                <YAxis
                    tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
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
                    formatter={(value: number) => [`${value}%`, undefined]}
                />
                <Legend
                    wrapperStyle={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}
                />
                {data.datasets.map((ds) => (
                    <Line
                        key={ds.label}
                        type="monotone"
                        dataKey={ds.label}
                        stroke={ds.color ?? '#6366f1'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, fill: ds.color ?? '#6366f1' }}
                    />
                ))}
            </LineChart>
        </ResponsiveContainer>
    );
}
