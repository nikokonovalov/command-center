import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Eye, MoreHorizontal, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import type { TableConfig, AIUseCaseItem, BadgeVariant } from '@command-center/types';
import UseCaseDetailPanel from './UseCaseDetailPanel';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Type-safe dynamic property access on AIUseCaseItem */
const getField = (item: AIUseCaseItem, key: string): unknown =>
    (item as unknown as Record<string, unknown>)[key];

// ─── Badge Variant → Tailwind Classes ────────────────────────────────────────

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-gray-100 text-gray-800',
};

// ─── Column Width Classes ────────────────────────────────────────────────────

const widthClasses: Record<string, string> = {
    sm: 'min-w-[120px]',
    md: 'min-w-[160px]',
    lg: 'min-w-[220px]',
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface UseCasesTableProps {
    config: TableConfig;
    data: AIUseCaseItem[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UseCasesTable({ config, data }: UseCasesTableProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [selectedItem, setSelectedItem] = useState<AIUseCaseItem | null>(null);

    // ── Derive state from URL search params ──
    const filterKeys = useMemo(() => config.filters.map(f => f.key), [config.filters]);

    const filters = useMemo(() => {
        const f: Record<string, string> = {};
        for (const key of filterKeys) {
            const val = searchParams.get(key);
            if (val) f[key] = val;
        }
        return f;
    }, [searchParams, filterKeys]);

    const searchQuery = searchParams.get('search') ?? '';
    const currentPage = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? String(config.defaultPageSize));

    // ── URL param helpers ──
    const updateParams = useCallback((updates: Record<string, string | null>) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            for (const [key, value] of Object.entries(updates)) {
                if (value === null || value === '') {
                    next.delete(key);
                } else {
                    next.set(key, value);
                }
            }
            // Reset to page 1 when changing filters/search/pageSize (but not when changing page itself)
            if (!('page' in updates)) {
                next.delete('page');
            }
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    // ── Derive filter options from data (for filters without predefined options) ──
    const filterOptions = useMemo(() => {
        const opts: Record<string, string[]> = {};
        for (const f of config.filters) {
            if (f.options) {
                opts[f.key] = f.options;
            } else {
                const unique = [...new Set(data.map(item => String(getField(item, f.key) ?? '')))].filter(Boolean).sort();
                opts[f.key] = unique;
            }
        }
        return opts;
    }, [config.filters, data]);

    // ── Filter + Search pipeline ──
    const filteredData = useMemo(() => {
        let result = data;

        // Apply filters
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                result = result.filter(item => {
                    const itemValue = String(getField(item, key) ?? '');
                    // Support partial match for fields like aiOnboardingStage that can contain comma-separated values
                    return itemValue === value || itemValue.includes(value);
                });
            }
        }

        // Apply search
        if (searchQuery && config.search) {
            const q = searchQuery.toLowerCase();
            result = result.filter(item =>
                config.search!.searchableKeys.some(key => {
                    const val = String(getField(item, key) ?? '').toLowerCase();
                    return val.includes(q);
                }),
            );
        }

        return result;
    }, [data, filters, searchQuery, config.search]);

    // ── Pagination ──
    const totalItems = filteredData.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const startIdx = (currentPage - 1) * pageSize;
    const pageData = filteredData.slice(startIdx, startIdx + pageSize);
    const startItem = totalItems > 0 ? startIdx + 1 : 0;
    const endItem = Math.min(startIdx + pageSize, totalItems);

    // ── Active filters ──
    const activeFilters = Object.entries(filters).filter(([, v]) => v);
    const hasActiveFilters = activeFilters.length > 0;

    const clearFilter = (key: string) => {
        updateParams({ [key]: null });
    };

    const clearAllFilters = () => {
        setSearchParams({}, { replace: true });
    };

    // ── Get display label for a filter value ──
    const getFilterLabel = (key: string, value: string) => {
        const filterConf = config.filters.find(f => f.key === key);
        return filterConf ? `${value}` : value;
    };

    // ── Render cell value ──
    const renderCell = (item: AIUseCaseItem, column: typeof config.columns[number]) => {
        const value = String(getField(item, column.key) ?? '');

        if (column.badge) {
            const variant = column.badge.variant[value];
            if (variant) {
                return (
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]}`}>
                        {value}
                    </span>
                );
            }
        }

        return <span className="text-gray-700">{value}</span>;
    };

    // ── Page numbers to display ──
    const getPageNumbers = () => {
        const pages: (number | '...')[] = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 3) pages.push('...');
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) pages.push(i);
            if (currentPage < totalPages - 2) pages.push('...');
            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div className="flex flex-col gap-5">
            {/* ── Page Header ── */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="mb-1 text-sm text-gray-500">
                        Home <span className="mx-1">/</span> <span className="text-gray-700">{config.name}</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-900">{config.name}</h1>
                    {config.description && (
                        <p className="mt-1 text-sm text-gray-500">{config.description}</p>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <select className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700">
                        <option>All Enterprise</option>
                    </select>
                    <div className="flex rounded-md border border-gray-300 overflow-hidden">
                        <button className="bg-gray-900 px-3 py-1.5 text-sm font-medium text-white">Enterprise</button>
                        <button className="bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50">OMAI</button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Last updated: {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                        <button className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Filter Count + Active Chips ── */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {hasActiveFilters ? (
                            <>
                                {activeFilters.map(([, v]) => v).join(', ')} : {totalItems.toLocaleString()}
                            </>
                        ) : (
                            <>AI Use Cases: {totalItems.toLocaleString()}</>
                        )}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter chips */}
                    {hasActiveFilters && (
                        <>
                            {activeFilters.map(([key, value]) => (
                                <span
                                    key={key}
                                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700"
                                >
                                    {getFilterLabel(key, value)}
                                    <button
                                        onClick={() => clearFilter(key)}
                                        className="ml-0.5 rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={clearAllFilters}
                                className="text-sm font-medium text-blue-600 hover:text-blue-800"
                            >
                                Clear All
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="flex items-center gap-2">
                {config.filters.map(f => (
                    <select
                        key={f.key}
                        value={filters[f.key] ?? ''}
                        onChange={e => updateParams({ [f.key]: e.target.value || null })}
                        className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                        <option value="">{f.label}</option>
                        {(filterOptions[f.key] ?? []).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                ))}

                <button className="rounded-md border border-gray-300 bg-white p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700">
                    <SlidersHorizontal size={16} />
                </button>

                {/* Search */}
                {config.search && (
                    <div className="relative ml-auto">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder={config.search.placeholder}
                            value={searchQuery}
                            onChange={e => updateParams({ search: e.target.value || null })}
                            className="rounded-md border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 placeholder-gray-400 hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-[220px]"
                        />
                    </div>
                )}

                <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                    Export As
                </button>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            {config.columns.map(col => (
                                <th
                                    key={col.key}
                                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 ${widthClasses[col.width ?? 'sm'] ?? ''}`}
                                >
                                    {col.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500 min-w-[80px]">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {pageData.length === 0 ? (
                            <tr>
                                <td colSpan={config.columns.length + 1} className="px-4 py-12 text-center text-gray-400">
                                    No use cases found matching the current filters.
                                </td>
                            </tr>
                        ) : (
                            pageData.map((item, idx) => (
                                <tr
                                    key={`${item.useCaseId}-${idx}`}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    {config.columns.map(col => (
                                        <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                                            {renderCell(item, col)}
                                        </td>
                                    ))}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedItem(item)}
                                                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                                                <MoreHorizontal size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                    {startItem}-{endItem} of {totalItems.toLocaleString()} items
                </span>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => updateParams({ page: String(Math.max(1, currentPage - 1)) })}
                        disabled={currentPage <= 1}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                    </button>

                    {getPageNumbers().map((page, idx) =>
                        page === '...' ? (
                            <span key={`dots-${idx}`} className="px-2 text-gray-400">...</span>
                        ) : (
                            <button
                                key={page}
                                onClick={() => updateParams({ page: String(page) })}
                                className={`min-w-[32px] rounded px-2 py-1 text-sm font-medium transition-colors ${
                                    currentPage === page
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ),
                    )}

                    <button
                        onClick={() => updateParams({ page: String(Math.min(totalPages, currentPage + 1)) })}
                        disabled={currentPage >= totalPages}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <span>Items per page</span>
                    <select
                        value={pageSize}
                        onChange={e => updateParams({ pageSize: e.target.value === String(config.defaultPageSize) ? null : e.target.value })}
                        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm"
                    >
                        {config.pageSizeOptions.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>
                </div>
            </div>
            {/* ── Detail Panel ── */}
            {selectedItem && (
                <UseCaseDetailPanel
                    item={selectedItem}
                    onClose={() => setSelectedItem(null)}
                />
            )}
        </div>
    );
}
