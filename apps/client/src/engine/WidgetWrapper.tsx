import { Suspense } from 'react';
import type { WidgetConfig } from '@command-center/types';
import { WidgetRegistry } from './WidgetRegistry';
import { WidgetErrorBoundary } from './WidgetErrorBoundary';

interface WidgetWrapperProps {
    config: WidgetConfig;
}

function WidgetSkeleton() {
    return (
        <div className="flex h-full flex-col gap-3 p-[18px]">
            <div className="skeleton h-[14px] w-[40%]" />
            <div className="skeleton h-[32px] w-[60%]" />
            <div className="skeleton flex-1 w-full" />
        </div>
    );
}

function UnknownWidget({ type }: { type: string }) {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-text-muted">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
            </svg>
            <p className="text-[0.75rem]">Unknown widget: <code>{type}</code></p>
        </div>
    );
}

/**
 * Wraps every widget with:
 * - Card chrome (title, header)
 * - <Suspense> for lazy loading (skeleton fallback)
 * - <ErrorBoundary> for crash isolation
 * - Live indicator for socket-connected widgets
 */
export default function WidgetWrapper({ config }: WidgetWrapperProps) {
    const WidgetComponent = WidgetRegistry[config.type];
    const isLive = config.dataSource.type === 'socket';

    // Some widgets render multiple self-contained cards and shouldn't have the global wrapper chrome
    const isBareWidget = ['lifecycle-kpi', 'risk-stats'].includes(config.type);

    if (isBareWidget) {
        return (
            <div className="flex h-full flex-col">
                {WidgetComponent ? (
                    <WidgetErrorBoundary>
                        <Suspense fallback={<WidgetSkeleton />}>
                            <WidgetComponent dataSource={config.dataSource} />
                        </Suspense>
                    </WidgetErrorBoundary>
                ) : (
                    <UnknownWidget type={config.type} />
                )}
            </div>
        );
    }

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md">
            <div className="flex h-full flex-col p-5">
                {(config.title || isLive || config.description) && (
                    <div className="shrink-0 mb-4">
                        {(config.title || isLive) && (
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="text-[16px] font-normal text-gray-700">{config.title}</h3>
                                {isLive && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-green-600">
                                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
                                        LIVE
                                    </div>
                                )}
                            </div>
                        )}
                        {config.description && (
                            <p className="text-xs text-gray-500">
                                {config.description}
                            </p>
                        )}
                    </div>
                )}

                <div className="flex-1 flex flex-col min-h-0">
                    {WidgetComponent ? (
                        <WidgetErrorBoundary>
                            <Suspense fallback={<WidgetSkeleton />}>
                                <WidgetComponent dataSource={config.dataSource} />
                            </Suspense>
                        </WidgetErrorBoundary>
                    ) : (
                        <UnknownWidget type={config.type} />
                    )}
                </div>
            </div>
        </div>
    );
}
