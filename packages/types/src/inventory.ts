// ─── AI Use Case Item (Inventory Entity) ────────────────────────────────────

export type LifecycleStage = 'POC' | 'Pilot' | 'Production' | 'Archived';
export type SlaStatus = 'On Track' | 'At SLA Limit' | 'SLA Breached';
export type AiTechnology = 'Agentic AI' | 'GenAI';
export type ApprovalStatus = 'Approved' | 'Pending' | 'Rejected';
export type SeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';
export type DriftCategory = 'Stable' | 'Watch' | 'High Risk';
export type AlertStatus = 'New' | 'Under Review' | 'Acknowledged';

export interface AIUseCaseItem {
    // ── Table columns ───────────────────────────────────────────────────────
    businessCaseId: string;
    useCaseId: string;
    useCaseName: string;
    lob: string;
    lifecycleStage: LifecycleStage;
    aiOnboardingStage: string;
    slaStatus: SlaStatus;
    aiTechnology: AiTechnology;
    status: ApprovalStatus;
    severity: SeverityLevel;

    // ── Lifecycle metrics ───────────────────────────────────────────────────
    daysInCurrentStage: number;
    expectedSlaDays: number;
    approvalDays: number;

    // ── Risk & compliance ───────────────────────────────────────────────────
    isActive: boolean;
    agentName: string | null;
    driftScore: number | null;
    driftCategory: DriftCategory | null;
    criticalAlerts: number;
    policyViolations: number;
    guardrailTriggers: number;
    monthlyCost: number;
    responsibleAIScore: number;

    // ── Model metrics (agent-deployed items) ────────────────────────────────
    accuracy: number | null;
    latency: number | null;
    hallucinationRate: number | null;

    // ── Alert fields (attention queue) ──────────────────────────────────────
    alertType: string | null;
    alertStatus: AlertStatus | null;
    owner: string | null;
    detectedTime: string | null;
}
