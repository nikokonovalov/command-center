import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[WidgetErrorBoundary]', error, info);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        this.props.onRetry?.();
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) return this.props.fallback;

            return (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-text-muted">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <p className="text-[0.8rem]">Something went wrong</p>
                    <button
                        onClick={this.handleRetry}
                        className="cursor-pointer rounded-lg border border-border bg-bg-elevated px-4 py-1.5 text-[0.8rem] font-medium text-text-secondary transition-all duration-150 hover:border-accent-indigo hover:bg-bg-card-hover hover:text-text-primary"
                    >
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
