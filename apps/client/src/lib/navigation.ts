/**
 * Build a URL to the "All AI Use Cases" table with pre-applied filters.
 *
 * Used by dashboard widgets to make cards/segments clickable.
 */
export function buildUseCasesUrl(filters: Record<string, string>): string {
    const params = new URLSearchParams(filters);
    const qs = params.toString();
    return qs ? `/use-cases?${qs}` : '/use-cases';
}
