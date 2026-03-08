import { useWidgetQuery } from '@/hooks/useWidgetQuery';
import type { WidgetProps } from '@/engine/WidgetRegistry';
import type { DataTableData } from '@command-center/types';

export default function DataTable({ dataSource }: WidgetProps) {
    const { data, isLoading } = useWidgetQuery<DataTableData>(dataSource);

    if (isLoading || !data) {
        return (
            <div className="flex flex-col gap-2">
                <div className="skeleton h-[32px] w-full" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div className="skeleton h-[36px] w-full" key={i} />
                ))}
            </div>
        );
    }

    return (
        <div className="max-h-full overflow-auto">
            <table className="w-full border-collapse text-[0.8rem]">
                <thead>
                    <tr className="border-b border-border-subtle">
                        {data.columns.map((col) => (
                            <th className="px-3.5 py-2.5 text-left text-[0.7rem] font-semibold uppercase tracking-widest text-text-muted" key={col.key}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.rows.map((row, i) => (
                        <tr className="border-b border-border-subtle transition-colors duration-100 hover:bg-bg-card-hover last:border-b-0" key={i}>
                            {data.columns.map((col) => (
                                <td className="px-3.5 py-2.5 text-text-secondary" key={col.key}>
                                    {col.key === 'status' ? (
                                        <span className={`inline-flex rounded-full px-2.5 py-[3px] text-[0.7rem] font-semibold ${row[col.key] === 'In Stock' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-amber/10 text-accent-amber'
                                            }`}>
                                            {String(row[col.key])}
                                        </span>
                                    ) : col.key === 'price' ? (
                                        `$${row[col.key]}`
                                    ) : (
                                        String(row[col.key] ?? '')
                                    )}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
