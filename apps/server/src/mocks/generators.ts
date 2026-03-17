import type {
    LifecycleKpiData,
    ProductionGrowthData,
    ApprovalTimeData,
    LifecycleFunnelData,
    StageTimelineData,
    BottlenecksData,
    OnboardingTrackerData,
    UseCasesByBUData,
    ApprovalStatusData,
    TechDistributionData,
    RiskStatsData,
    LiveRiskEventsData,
    ResponsibleAIIndexData,
    ModelPerformanceData,
    ModelQualityRiskData,
    AIIndexTrendData,
    MonthlyCostData,
    AttentionQueueData,
    BehavioralDriftData,
    RiskScoreBreakdownData,
} from '@command-center/types';

// ─── AI Lifecycle Generators ─────────────────────────────────────────────────

export function generateLifecycleKpiData(): LifecycleKpiData {
    const total = 1440;
    const poc = 600;
    const pilot = 360;
    const production = 240;
    const archived = 240;
    return {
        cards: [
            { label: 'Total AI Use Cases', value: total, percentage: 100, icon: 'cpu', variant: 'dark' },
            { label: 'POC', value: poc, percentage: +(poc / total * 100).toFixed(1), icon: 'flask', variant: 'light' },
            { label: 'Pilot', value: pilot, percentage: +(pilot / total * 100).toFixed(1), icon: 'rocket', variant: 'light' },
            { label: 'Production', value: production, percentage: +(production / total * 100).toFixed(1), icon: 'check-circle', variant: 'light' },
            { label: 'Archived', value: archived, percentage: +(archived / total * 100).toFixed(1), icon: 'archive', variant: 'light' },
        ],
    };
}

export function generateProductionGrowthData(): ProductionGrowthData {
    const prev = 214 + Math.floor(Math.random() * 10);
    const curr = prev + Math.floor(Math.random() * 30) + 10;
    const pct = +((curr - prev) / prev * 100).toFixed(0);
    return {
        growthPercent: pct,
        previousCount: prev,
        currentCount: curr,
        sparkline: Array.from({ length: 8 }, () => Math.floor(Math.random() * 40) + 60),
    };
}

export function generateApprovalTimeData(): ApprovalTimeData {
    return {
        avgDays: 18,
        deltaDays: 2,
        deltaDirection: 'down',
        deltaLabel: 'vs last Quarter',
        slaStatus: 'Within SLA',
    };
}

export function generateLifecycleFunnelData(): LifecycleFunnelData {
    return {
        totalUseCases: 1440,
        stages: [
            { label: 'POC', transitionRate: 41.7 },
            { label: 'Pilot', transitionRate: 60.0 },
            { label: 'Production', transitionRate: 66.7 },
        ],
        productionTransitionRate: 66.7,
    };
}

export function generateStageTimelineData(): StageTimelineData {
    return {
        stages: [
            { label: 'POC', icon: 'flask', avgDuration: 18, expectedSla: 18, status: 'At SLA Limit' },
            { label: 'Pilot', icon: 'rocket', avgDuration: 30, expectedSla: 25, status: 'SLA Breached' },
            { label: 'Production', icon: 'check-circle', avgDuration: 14, expectedSla: 15, status: 'On Track' },
        ],
        summary: 'Pilot stage is breaching SLA, POC is at risk, while Ideation and Production remain healthy.',
    };
}

export function generateBottlenecksData(): BottlenecksData {
    return {
        items: [
            { label: 'SLA Breaches', description: 'Overdue governance reviews requiring action.', count: 12, severity: 'warning' },
            { label: 'High-Risk Pending Review', description: 'High and critical risk AI initiatives awaiting governance approval.', count: 4, severity: 'warning' },
            { label: 'Stuck > 30 Days', description: 'Use cases with no lifecycle movement beyond the defined threshold.', count: 5, severity: 'warning' },
        ],
    };
}

export function generateOnboardingTrackerData(): OnboardingTrackerData {
    return {
        totalPending: 144,
        categories: [
            { label: 'Pending CISO', count: 60, color: '#1e293b' },
            { label: 'Pending CBDC', count: 38, color: '#6366f1' },
            { label: 'Pending MRM', count: 26, color: '#0ea5e9' },
            { label: 'Pending NAC', count: 20, color: '#94a3b8' },
        ],
    };
}

export function generateUseCasesByBUData(): UseCasesByBUData {
    return {
        units: [
            { name: 'Service Ops', count: 200 },
            { name: 'Client', count: 240 },
            { name: 'COO', count: 170 },
            { name: 'Finance', count: 160 },
            { name: 'GLAC', count: 150 },
            { name: 'HR', count: 120 },
            { name: 'Internal Audit', count: 260 },
            { name: 'Risk', count: 190 },
            { name: 'Services', count: 320 },
            { name: 'Technology', count: 180 },
        ],
    };
}

export function generateApprovalStatusData(): ApprovalStatusData {
    return { approved: 82, rejected: 6, pending: 12 };
}

export function generateTechDistributionData(): TechDistributionData {
    return {
        segments: [
            { label: 'Agentic AI', percentage: 33.3, count: 480, color: '#1e293b' },
            { label: 'GenAI', percentage: 66.7, count: 960, color: '#0ea5e9' },
        ],
    };
}

// ─── AI Risk Generators ──────────────────────────────────────────────────────

export function generateRiskStatsData(): RiskStatsData[] {
    return [
        { label: 'Active Use Cases', value: 128, change: 5, changeLabel: 'vs last week', icon: 'cpu' },
        { label: 'Active Agents', value: 74, change: 8, changeLabel: 'vs last week', icon: 'bot' },
    ];
}

export function generateLiveRiskEventsData(): LiveRiskEventsData {
    return {
        events: [
            { label: 'Critical Alerts', value: 6, change: 12, trend: 'down', description: 'Critical AI incidents requiring action.', icon: 'alert-triangle', color: '#ef4444' },
            { label: 'Drift Detected', value: 9, change: 3, trend: 'up', description: 'Models exceeding defined drift thresholds.', icon: 'trending-up', color: '#f59e0b' },
            { label: 'Policy Violations', value: 11, change: 12, trend: 'down', description: 'Compliance Breaches Detected.', icon: 'shield-alert', color: '#8b5cf6' },
            { label: 'Guardrail Triggers', value: 21, change: 12, trend: 'down', description: 'Automated Guardrail Interventions.', icon: 'shield', color: '#06b6d4' },
        ],
    };
}

export function generateResponsibleAIIndexData(): ResponsibleAIIndexData {
    return { score: 92.4, change: 3.5, changeLabel: 'vs last month' };
}

export function generateModelPerformanceData(): ModelPerformanceData {
    return {
        labels: ['W1', 'W2', 'W3', 'W4'],
        accuracy: [90.2, 91.8, 92.8, 93.7],
        latency: [420, 380, 260, 495],
        currentAccuracy: 93.7,
        accuracyChange: 1.6,
        currentLatency: 495,
        latencyChange: 35,
    };
}

export function generateModelQualityRiskData(): ModelQualityRiskData {
    return {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
        hallucinationRates: [3.2, 5.1, 2.8, 4.5, 6.2, 1.9],
        currentRate: 1.9,
        rateChange: -0.4,
    };
}

export function generateAIIndexTrendData(): AIIndexTrendData {
    return {
        labels: ['W1', 'W2', 'W3', 'W4'],
        values: [88.0, 90.5, 88.3, 92.4],
        currentScore: 92.4,
        change: 3.5,
        highlightPoint: { index: 2, value: 88.3 },
    };
}

export function generateMonthlyCostData(): MonthlyCostData {
    const base = 850000;
    const jitter = Math.floor(Math.random() * 20000) - 10000;
    const cost = base + jitter;
    return {
        formattedCost: `$${(cost / 1000).toFixed(0)}K`,
        rawCost: cost,
        change: 6,
        changeLabel: 'vs last month',
    };
}

export function generateAttentionQueueData(): AttentionQueueData {
    return {
        items: [
            { id: 'aq-001', name: 'Orion Assistant', alertType: 'Data Leakage Risk', severity: 'Critical', status: 'New', owner: 'security-ops', detectedTime: '10 mins ago' },
            { id: 'aq-002', name: 'Helix Navigator', alertType: 'Model Drift', severity: 'High', status: 'Under Review', owner: 'ml-platform', detectedTime: '45 mins ago' },
            { id: 'aq-003', name: 'Customer Support Bot', alertType: 'Toxicity Spikes', severity: 'Critical', status: 'New', owner: 'cs-team', detectedTime: '1 hour ago' },
            { id: 'aq-004', name: 'Pricing Engine V2', alertType: 'Latency Degradation', severity: 'Medium', status: 'Acknowledged', owner: 'pricing-infra', detectedTime: '2 hours ago' },
            { id: 'aq-005', name: 'HR Recruiter AI', alertType: 'Bias Alert', severity: 'High', status: 'New', owner: 'hr-tech', detectedTime: '3 hours ago' },
        ]
    };
}

export function generateBehavioralDriftData(): BehavioralDriftData {
    return {
        agents: [
            { name: 'Orion Assistant', score: 3.8, category: 'High Risk' },
            { name: 'Aura Client Bot', score: 2.9, category: 'Watch' },
            { name: 'Vanguard RPA', score: 2.5, category: 'Watch' },
            { name: 'Cognito Fraud Agent', score: 1.8, category: 'Stable' },
            { name: 'Cortex Automation', score: 4.8, category: 'High Risk' },
            { name: 'Stratum Risk Monitor', score: 2.2, category: 'Stable' },
            { name: 'Echo Support Agent', score: 3.2, category: 'Watch' },
            { name: 'Helix Navigator', score: 1.5, category: 'Stable' },
        ],
    };
}

export function generateRiskScoreBreakdownData(): RiskScoreBreakdownData {
    return {
        agents: [
            { name: 'Orion Assistant', criticalAlerts: 15, drift: 25, policyViolations: 10, guardrailTriggers: 30 },
            { name: 'Aura Client Bot', criticalAlerts: 10, drift: 20, policyViolations: 15, guardrailTriggers: 20 },
            { name: 'Vanguard RPA', criticalAlerts: 8, drift: 12, policyViolations: 10, guardrailTriggers: 15 },
            { name: 'Cognito Fraud Agent', criticalAlerts: 20, drift: 15, policyViolations: 8, guardrailTriggers: 12 },
            { name: 'Cortex Automation', criticalAlerts: 12, drift: 18, policyViolations: 22, guardrailTriggers: 18 },
            { name: 'Stratum Risk Monitor', criticalAlerts: 5, drift: 10, policyViolations: 12, guardrailTriggers: 8 },
        ],
    };
}
