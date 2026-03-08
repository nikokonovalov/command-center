// ─── API Envelope Types ──────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data: T;
    meta?: {
        timestamp: string;
        requestId?: string;
    };
}

export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, unknown>;
}
