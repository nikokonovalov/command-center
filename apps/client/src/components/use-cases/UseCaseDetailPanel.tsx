import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ExternalLink, ChevronRight } from 'lucide-react';
import type { AIUseCaseItem } from '@command-center/types';

// ─── Props ───────────────────────────────────────────────────────────────────

interface UseCaseDetailPanelProps {
    item: AIUseCaseItem;
    onClose: () => void;
}

// ─── Governance Approval Derivation ──────────────────────────────────────────

type ApprovalState = 'Completed' | 'Pending' | 'Not Started';

interface GovernanceRow {
    label: string;
    state: ApprovalState;
    progress: number; // 0–100
    detail: string;
}

/** The fixed approval sequence. Items are processed in order. */
const APPROVAL_SEQUENCE = ['CISO', 'CBDC', 'MRM', 'NAC'] as const;

/** Mock reviewer names */
const REVIEWERS: Record<string, string> = {
    MRM: 'John Smith',
    CBDC: 'Sarah Lee',
    CISO: 'Michael Brown',
};

/**
 * Derive governance approval tracker from the aiOnboardingStage field.
 *
 * Logic:
 * - "Approved" → all 4 completed
 * - "Pending X" → everything before X in the sequence is completed, X is pending, rest not started
 * - Comma-separated "Pending X, Pending Y" → earliest pending determines the split
 */
function deriveGovernance(item: AIUseCaseItem): GovernanceRow[] {
    const stage = item.aiOnboardingStage;

    if (stage === 'Approved') {
        return APPROVAL_SEQUENCE.map(label => ({
            label,
            state: 'Completed' as const,
            progress: 100,
            detail: 'Completed',
        }));
    }

    // Find the first pending approval in the sequence
    let firstPendingIdx: number = APPROVAL_SEQUENCE.length; // default: all completed
    for (let i = 0; i < APPROVAL_SEQUENCE.length; i++) {
        if (stage.includes(APPROVAL_SEQUENCE[i])) {
            firstPendingIdx = i;
            break;
        }
    }

    const overdueDays = item.daysInCurrentStage > item.expectedSlaDays
        ? item.daysInCurrentStage - item.expectedSlaDays
        : 0;

    return APPROVAL_SEQUENCE.map((label, i) => {
        if (i < firstPendingIdx) {
            return { label, state: 'Completed' as const, progress: 100, detail: 'Completed' };
        }
        if (i === firstPendingIdx) {
            const pendingProgress = Math.min(90, Math.max(20, (item.daysInCurrentStage / Math.max(item.expectedSlaDays, 1)) * 70));
            const detail = overdueDays > 0
                ? `Pending – ${overdueDays} days overdue`
                : `Pending`;
            return { label, state: 'Pending' as const, progress: pendingProgress, detail };
        }
        return { label, state: 'Not Started' as const, progress: 0, detail: 'Not Started' };
    });
}

// ─── Lifecycle Timeline Derivation ───────────────────────────────────────────

interface TimelineRow {
    label: string;
    state: 'completed' | 'active' | 'not_started';
    days: number | null;
    slaDays: number | null;
    progress: number; // 0–100
    exceeded: boolean;
}

const LIFECYCLE_ORDER = ['POC', 'Pilot', 'Production'] as const;
const LIFECYCLE_LABELS: Record<string, string> = {
    POC: 'POC / Development',
    Pilot: 'Pilot',
    Production: 'Production',
};

function deriveLifecycleTimeline(item: AIUseCaseItem): TimelineRow[] {
    const currentIdx = LIFECYCLE_ORDER.indexOf(item.lifecycleStage as typeof LIFECYCLE_ORDER[number]);
    // Archived items are treated as having completed all stages
    const isArchived = item.lifecycleStage === 'Archived';

    return LIFECYCLE_ORDER.map((stage, i) => {
        const label = LIFECYCLE_LABELS[stage];

        if (isArchived || i < currentIdx) {
            return { label, state: 'completed' as const, days: null, slaDays: null, progress: 100, exceeded: false };
        }

        if (i === currentIdx) {
            const days = item.daysInCurrentStage;
            const slaDays = item.expectedSlaDays;
            const exceeded = days > slaDays;
            const progress = Math.min(100, (days / Math.max(slaDays, 1)) * 100);
            return { label, state: 'active' as const, days, slaDays, progress, exceeded };
        }

        return { label, state: 'not_started' as const, days: null, slaDays: null, progress: 0, exceeded: false };
    });
}

// ─── Audit Log Derivation ────────────────────────────────────────────────────

function deriveAuditLog(item: AIUseCaseItem): { date: string; text: string }[] {
    const now = new Date();
    const entries: { date: string; text: string }[] = [];

    // Most recent event first
    const daysAgo = (d: number) => {
        const dt = new Date(now);
        dt.setDate(dt.getDate() - d);
        return dt.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    if (item.slaStatus === 'SLA Breached') {
        entries.push({ date: daysAgo(2), text: `${item.aiOnboardingStage.replace('Pending ', '')} review pending beyond SLA.` });
    }

    // Derive completed approvals from governance
    const governance = deriveGovernance(item);
    const completed = governance.filter(g => g.state === 'Completed');
    completed.reverse().forEach((g, i) => {
        entries.push({ date: daysAgo(5 + i * 7), text: `${g.label} approval completed.` });
    });

    if (entries.length < 3) {
        entries.push({ date: daysAgo(item.approvalDays), text: 'Use case submitted for review.' });
    }

    return entries.slice(0, 4);
}

// ─── Badge helpers ───────────────────────────────────────────────────────────

function lifecycleBadgeClass(stage: string): string {
    switch (stage) {
        case 'POC': return 'bg-blue-100 text-blue-800';
        case 'Pilot': return 'bg-yellow-100 text-yellow-800';
        case 'Production': return 'bg-green-100 text-green-800';
        case 'Archived': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function slaBadgeClass(status: string): string {
    switch (status) {
        case 'On Track': return 'bg-green-100 text-green-800';
        case 'At SLA Limit': return 'bg-yellow-100 text-yellow-800';
        case 'SLA Breached': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-800';
    }
}

function governanceBarColor(state: ApprovalState): string {
    switch (state) {
        case 'Completed': return 'bg-blue-600';
        case 'Pending': return 'bg-blue-500';
        case 'Not Started': return 'bg-gray-200';
    }
}

function governanceStatusClass(state: ApprovalState): string {
    switch (state) {
        case 'Completed': return 'text-green-600';
        case 'Pending': return 'text-amber-600';
        case 'Not Started': return 'text-gray-400';
    }
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function UseCaseDetailPanel({ item, onClose }: UseCaseDetailPanelProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Trigger enter animation after mount
    useEffect(() => {
        // Small delay to ensure the initial translate-x-full is painted first
        const raf = requestAnimationFrame(() => setIsOpen(true));
        return () => cancelAnimationFrame(raf);
    }, []);

    // Escape key handler
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        // Wait for exit animation to finish
        setTimeout(onClose, 300);
    };

    // Derive data
    const governance = deriveGovernance(item);
    const timeline = deriveLifecycleTimeline(item);
    const auditLog = deriveAuditLog(item);

    const panel = (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />

            {/* Panel */}
            <div
                className={`absolute right-0 top-0 h-full w-[700px] max-w-[90vw] bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* ── Header ── */}
                <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-gray-900 leading-snug">
                            Summary of {item.useCaseName}
                        </h2>
                        <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                            <span>Business Case ID: {item.businessCaseId}</span>
                            <span>Use Case ID: {item.useCaseId}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                        <button className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            View Details
                            <ExternalLink size={12} />
                        </button>
                        <button
                            onClick={handleClose}
                            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ── Scrollable Content ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs">
                        <div>
                            <span className="text-gray-500">Use Cases</span>
                            <div className="mt-0.5 font-medium text-gray-800">{item.useCaseName}</div>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <span className="text-gray-500">Lifecycle Stage</span>
                            <div className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${lifecycleBadgeClass(item.lifecycleStage)}`}>
                                    {item.lifecycleStage === 'POC' ? 'POC / Development' : item.lifecycleStage}
                                </span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <span className="text-gray-500">AI Onboarding Stage</span>
                            <div className="mt-1">
                                <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                    {item.aiOnboardingStage}
                                </span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gray-200" />
                        <div>
                            <span className="text-gray-500">SLA Status</span>
                            <div className="mt-1">
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${slaBadgeClass(item.slaStatus)}`}>
                                    {item.slaStatus}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── Assigned Reviewers ── */}
                    <section className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900">Assigned Reviewers</h3>
                        <ul className="mt-2 space-y-1 text-sm text-gray-700">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                MRM Owner: {REVIEWERS.MRM}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                CBDC Reviewer: {REVIEWERS.CBDC}
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                CISO Reviewer: {REVIEWERS.CISO}
                            </li>
                        </ul>
                    </section>

                    {/* ── Lifecycle Timeline ── */}
                    <section className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900">Lifecycle Timeline</h3>
                        <div className="mt-3 space-y-4">
                            {timeline.map((row) => (
                                <div key={row.label}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700">{row.label}</span>
                                        {row.state === 'active' && (
                                            <span className={row.exceeded ? 'text-red-600 font-medium' : 'text-gray-500'}>
                                                {row.days} days (SLA: {row.slaDays} days)
                                            </span>
                                        )}
                                        {row.state === 'not_started' && (
                                            <span className="text-gray-400 italic">Not Started</span>
                                        )}
                                    </div>
                                    {row.state !== 'not_started' && (
                                        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    row.state === 'completed' ? 'bg-green-500' :
                                                    row.exceeded ? 'bg-green-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${Math.min(row.progress, 100)}%` }}
                                            />
                                        </div>
                                    )}
                                    {row.state === 'active' && row.exceeded && (
                                        <div className="mt-1 flex items-center gap-1 text-[11px] text-red-600">
                                            <ChevronRight size={10} />
                                            Exceeded SLA threshold
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Governance Approval Tracker ── */}
                    <section className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900">Governance Approval Tracker</h3>
                        <div className="mt-3 space-y-3">
                            {governance.map((row) => (
                                <div key={row.label}>
                                    <div className="flex items-center justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700">{row.label}</span>
                                        <span className={`font-medium ${governanceStatusClass(row.state)}`}>
                                            {row.detail}
                                        </span>
                                    </div>
                                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${governanceBarColor(row.state)}`}
                                            style={{ width: `${row.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Timeline & Audit Log ── */}
                    <section className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-900">Timeline & Audit Log</h3>
                        <div className="mt-2 space-y-1.5 text-xs text-gray-600">
                            {auditLog.map((entry, i) => (
                                <div key={i}>
                                    <span className="font-medium text-gray-700">{entry.date}:</span>{' '}
                                    {entry.text}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* ── Footer ── */}
                <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                    <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        View in AgentFlow
                    </button>
                    <button
                        onClick={handleClose}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(panel, document.body);
}
