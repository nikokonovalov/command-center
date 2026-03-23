// ─── Table Configuration (Server-Driven) ─────────────────────────────────────

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface TableColumnConfig {
    /** Property key on the data item (e.g., 'businessCaseId') */
    key: string;
    /** Display header label (e.g., 'Business Case ID') */
    label: string;
    /** Column width hint */
    width?: 'sm' | 'md' | 'lg';
    /** Whether column is sortable */
    sortable?: boolean;
    /** Badge rendering — maps data values to semantic variants */
    badge?: {
        variant: Record<string, BadgeVariant>;
    };
}

export interface TableFilterConfig {
    /** Property key to filter on */
    key: string;
    /** Dropdown default label (e.g., 'All Lifecycle Stage') */
    label: string;
    /** Predefined options; if omitted, derive unique values from data */
    options?: string[];
}

export interface TableConfig {
    id: string;
    name: string;
    description?: string;
    /** REST endpoint for fetching all table data */
    dataEndpoint: string;
    /** Column definitions (order = display order) */
    columns: TableColumnConfig[];
    /** Filter bar definitions */
    filters: TableFilterConfig[];
    /** Search configuration */
    search?: {
        placeholder: string;
        /** Which item keys to search across */
        searchableKeys: string[];
    };
    /** Default items per page */
    defaultPageSize: number;
    /** Available page size options */
    pageSizeOptions: number[];
}
