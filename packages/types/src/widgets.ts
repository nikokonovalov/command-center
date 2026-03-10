// ─── AI Lifecycle Dashboard ──────────────────────────────────────────────────

export interface LifecycleKpiData {
    cards: {
        label: string;
        value: number;
        percentage: number;
        icon: string;
        variant: 'dark' | 'light';
    }[];
}

export interface ProductionGrowthData {
    growthPercent: number;
    previousCount: number;
    currentCount: number;
    sparkline: number[];
}

export interface ApprovalTimeData {
    avgDays: number;
    deltaDays: number;
    deltaDirection: 'up' | 'down';
    deltaLabel: string;
    slaStatus: 'Within SLA' | 'At SLA Limit' | 'SLA Breached';
}

export interface LifecycleFunnelData {
    totalUseCases: number;
    stages: {
        label: string;
        transitionRate: number;
    }[];
    productionTransitionRate: number;
}

export interface StageTimelineData {
    stages: {
        label: string;
        icon: string;
        avgDuration: number;
        expectedSla: number;
        status: 'On Track' | 'At SLA Limit' | 'SLA Breached';
    }[];
    summary: string;
}

export interface BottlenecksData {
    items: {
        label: string;
        description: string;
        count: number;
        severity: 'warning' | 'critical';
    }[];
}

export interface OnboardingTrackerData {
    totalPending: number;
    categories: {
        label: string;
        count: number;
        color: string;
    }[];
}

export interface UseCasesByBUData {
    units: {
        name: string;
        count: number;
    }[];
}

export interface ApprovalStatusData {
    approved: number;
    rejected: number;
    pending: number;
}

export interface TechDistributionData {
    segments: {
        label: string;
        percentage: number;
        count: number;
        color: string;
    }[];
}

// ─── AI Risk & Compliance Dashboard ──────────────────────────────────────────

export interface RiskStatsData {
    label: string;
    value: number;
    change: number;
    changeLabel: string;
    icon: string;
}

export interface LiveRiskEventsData {
    events: {
        label: string;
        value: number;
        change: number;
        trend: 'up' | 'down';
        description: string;
        icon: string;
        color: string;
    }[];
}

export interface ResponsibleAIIndexData {
    score: number;
    change: number;
    changeLabel: string;
}

export interface ModelPerformanceData {
    labels: string[];
    accuracy: number[];
    latency: number[];
    currentAccuracy: number;
    accuracyChange: number;
    currentLatency: number;
    latencyChange: number;
}

export interface ModelQualityRiskData {
    labels: string[];
    hallucinationRates: number[];
    currentRate: number;
    rateChange: number;
}

export interface AIIndexTrendData {
    labels: string[];
    values: number[];
    currentScore: number;
    change: number;
    highlightPoint: { index: number; value: number };
}

export interface MonthlyCostData {
    formattedCost: string;
    rawCost: number;
    change: number;
    changeLabel: string;
}

export interface AttentionQueueItem {
    id: string;
    name: string;
    alertType: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'New' | 'Under Review' | 'Acknowledged';
    owner: string;
    detectedTime: string;
}

export interface AttentionQueueData {
    items: AttentionQueueItem[];
}

export interface BehavioralDriftData {
    agents: {
        name: string;
        score: number;
        category: 'Stable' | 'Watch' | 'High Risk';
    }[];
}

export interface RiskScoreBreakdownData {
    agents: {
        name: string;
        criticalAlerts: number;
        drift: number;
        policyViolations: number;
        guardrailTriggers: number;
    }[];
}
