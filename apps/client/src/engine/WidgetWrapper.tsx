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

    return (
        <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-border-subtle bg-bg-card transition-all duration-200 hover:border-border hover:shadow-2xl">
            <div className="flex items-center justify-between border-b border-border-subtle px-[18px] py-[14px]">
                <h3 className="text-[0.8rem] font-semibold uppercase tracking-widest text-text-secondary">{config.title}</h3>
                {isLive && (
                    <div className="flex items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-wider text-accent-emerald">
                        <span className="h-[7px] w-[7px] animate-pulse-dot rounded-full bg-accent-emerald" />
                        Live
                    </div>
                )}
            </div>
            <div className="relative flex flex-1 flex-col overflow-hidden p-[18px]">
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
    );
}
