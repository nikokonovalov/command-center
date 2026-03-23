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
import { inventory } from './inventory';

// ─── Helpers ────────────────────────────────────────────────────────────────

const round = (n: number, d = 1) => +n.toFixed(d);

const byStage = (stage: string) => inventory.filter(i => i.lifecycleStage === stage);
const active = () => inventory.filter(i => i.isActive);
const withAgent = () => inventory.filter(i => i.agentName !== null);

// ─── AI Lifecycle Generators ─────────────────────────────────────────────────

export function generateLifecycleKpiData(): LifecycleKpiData {
    const total = inventory.length;
    const poc = byStage('POC').length;
    const pilot = byStage('Pilot').length;
    const production = byStage('Production').length;
    const archived = byStage('Archived').length;

    return {
        cards: [
            { label: 'Total AI Use Cases', value: total, percentage: 100, icon: 'cpu', variant: 'dark' },
            { label: 'POC', value: poc, percentage: round(poc / total * 100), icon: 'flask', variant: 'light' },
            { label: 'Pilot', value: pilot, percentage: round(pilot / total * 100), icon: 'rocket', variant: 'light' },
            { label: 'Production', value: production, percentage: round(production / total * 100), icon: 'check-circle', variant: 'light' },
            { label: 'Archived', value: archived, percentage: round(archived / total * 100), icon: 'archive', variant: 'light' },
        ],
    };
}

export function generateProductionGrowthData(): ProductionGrowthData {
    const curr = byStage('Production').length;
    const delta = Math.floor(Math.random() * 3) + 1;
    const prev = curr - delta;
    const pct = round((curr - prev) / prev * 100, 0);

    return {
        growthPercent: pct,
        previousCount: prev,
        currentCount: curr,
        sparkline: Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + (curr - 8)),
    };
}

export function generateApprovalTimeData(): ApprovalTimeData {
    const allDays = inventory.map(i => i.approvalDays);
    const avg = round(allDays.reduce((s, d) => s + d, 0) / allDays.length, 0);
    const slaStatus = avg <= 15 ? 'Within SLA' : avg <= 18 ? 'At SLA Limit' : 'SLA Breached';

    return {
        avgDays: avg,
        deltaDays: 2,
        deltaDirection: 'down',
        deltaLabel: 'vs last Quarter',
        slaStatus,
    };
}

export function generateLifecycleFunnelData(): LifecycleFunnelData {
    const total = inventory.length;
    const pocCount = byStage('POC').length;
    const pilotCount = byStage('Pilot').length;
    const prodCount = byStage('Production').length;

    const pocToPilot = pocCount > 0 ? round((pilotCount + prodCount) / pocCount * 100) : 0;
    const pilotToProd = pilotCount > 0 ? round(prodCount / pilotCount * 100) : 0;
    const prodRate = total > 0 ? round(prodCount / total * 100) : 0;

    return {
        totalUseCases: total,
        stages: [
            { label: 'POC', transitionRate: pocToPilot },
            { label: 'Pilot', transitionRate: pilotToProd },
            { label: 'Production', transitionRate: prodRate },
        ],
        productionTransitionRate: prodRate,
    };
}

export function generateStageTimelineData(): StageTimelineData {
    const stages: Array<{ label: string; icon: string; items: typeof inventory }> = [
        { label: 'POC', icon: 'flask', items: byStage('POC') },
        { label: 'Pilot', icon: 'rocket', items: byStage('Pilot') },
        { label: 'Production', icon: 'check-circle', items: byStage('Production') },
    ];

    const stageData = stages.map(s => {
        const avgDuration = s.items.length > 0
            ? round(s.items.reduce((sum, i) => sum + i.daysInCurrentStage, 0) / s.items.length, 0)
            : 0;
        const avgSla = s.items.length > 0
            ? round(s.items.reduce((sum, i) => sum + i.expectedSlaDays, 0) / s.items.length, 0)
            : 0;

        const status: 'On Track' | 'At SLA Limit' | 'SLA Breached' =
            avgDuration > avgSla ? 'SLA Breached'
            : avgDuration >= avgSla - 1 ? 'At SLA Limit'
            : 'On Track';

        return {
            label: s.label,
            icon: s.icon,
            avgDuration,
            expectedSla: avgSla,
            status,
        };
    });

    const breached = stageData.filter(s => s.status === 'SLA Breached').map(s => s.label);
    const atRisk = stageData.filter(s => s.status === 'At SLA Limit').map(s => s.label);
    const healthy = stageData.filter(s => s.status === 'On Track').map(s => s.label);

    let summary = '';
    if (breached.length > 0) summary += `${breached.join(', ')} stage is breaching SLA`;
    if (atRisk.length > 0) summary += `${summary ? ', ' : ''}${atRisk.join(', ')} is at risk`;
    if (healthy.length > 0) summary += `${summary ? ', while ' : ''}${healthy.join(' and ')} remain${healthy.length === 1 ? 's' : ''} healthy.`;
    if (!summary.endsWith('.')) summary += '.';

    return { stages: stageData, summary };
}

export function generateBottlenecksData(): BottlenecksData {
    const slaBreaches = inventory.filter(i => i.slaStatus === 'SLA Breached').length;
    const highRiskPending = inventory.filter(
        i => (i.severity === 'Critical' || i.severity === 'High') && i.status === 'Pending',
    ).length;
    const stuck = inventory.filter(i => i.daysInCurrentStage > 30).length;

    return {
        items: [
            { label: 'SLA Breaches', description: 'Overdue governance reviews requiring action.', count: slaBreaches, severity: 'warning' },
            { label: 'High-Risk Pending Review', description: 'High and critical risk AI initiatives awaiting governance approval.', count: highRiskPending, severity: 'warning' },
            { label: 'Stuck > 30 Days', description: 'Use cases with no lifecycle movement beyond the defined threshold.', count: stuck, severity: 'warning' },
        ],
    };
}

export function generateOnboardingTrackerData(): OnboardingTrackerData {
    const pending = inventory.filter(i => i.aiOnboardingStage.includes('Pending'));

    const categories: Record<string, number> = { CISO: 0, CBDC: 0, MRM: 0, NAC: 0 };
    for (const item of pending) {
        if (item.aiOnboardingStage.includes('CISO')) categories.CISO++;
        if (item.aiOnboardingStage.includes('CBDC')) categories.CBDC++;
        if (item.aiOnboardingStage.includes('MRM')) categories.MRM++;
        if (item.aiOnboardingStage.includes('NAC')) categories.NAC++;
    }

    return {
        totalPending: pending.length,
        categories: [
            { label: 'Pending CISO', count: categories.CISO, color: '#1e293b' },
            { label: 'Pending CBDC', count: categories.CBDC, color: '#6366f1' },
            { label: 'Pending MRM', count: categories.MRM, color: '#0ea5e9' },
            { label: 'Pending NAC', count: categories.NAC, color: '#94a3b8' },
        ],
    };
}

export function generateUseCasesByBUData(): UseCasesByBUData {
    const buCounts: Record<string, number> = {};
    for (const item of inventory) {
        buCounts[item.lob] = (buCounts[item.lob] || 0) + 1;
    }

    const units = Object.entries(buCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    return { units };
}

export function generateApprovalStatusData(): ApprovalStatusData {
    const total = inventory.length;
    const approved = inventory.filter(i => i.status === 'Approved').length;
    const rejected = inventory.filter(i => i.status === 'Rejected').length;
    const pending = inventory.filter(i => i.status === 'Pending').length;

    return {
        approved: round(approved / total * 100, 0),
        rejected: round(rejected / total * 100, 0),
        pending: round(pending / total * 100, 0),
    };
}

export function generateTechDistributionData(): TechDistributionData {
    const total = inventory.length;
    const agentic = inventory.filter(i => i.aiTechnology === 'Agentic AI').length;
    const genai = inventory.filter(i => i.aiTechnology === 'GenAI').length;

    return {
        segments: [
            { label: 'Agentic AI', percentage: round(agentic / total * 100), count: agentic, color: '#1e293b' },
            { label: 'GenAI', percentage: round(genai / total * 100), count: genai, color: '#0ea5e9' },
        ],
    };
}

// ─── AI Risk Generators ──────────────────────────────────────────────────────

export function generateRiskStatsData(): RiskStatsData[] {
    const activeItems = active();
    const agents = withAgent();

    return [
        { label: 'Active Use Cases', value: activeItems.length, change: 5, changeLabel: 'vs last week', icon: 'cpu' },
        { label: 'Active Agents', value: agents.length, change: 8, changeLabel: 'vs last week', icon: 'bot' },
    ];
}

export function generateLiveRiskEventsData(): LiveRiskEventsData {
    const activeItems = active();
    const criticalAlerts = activeItems.reduce((sum, i) => sum + i.criticalAlerts, 0);
    const driftDetected = activeItems.filter(i => i.driftScore !== null && i.driftScore > 3).length;
    const policyViolations = activeItems.reduce((sum, i) => sum + i.policyViolations, 0);
    const guardrailTriggers = activeItems.reduce((sum, i) => sum + i.guardrailTriggers, 0);

    return {
        events: [
            { label: 'Critical Alerts', value: criticalAlerts, change: 12, trend: 'down', description: 'Critical AI incidents requiring action.', icon: 'alert-triangle', color: '#ef4444' },
            { label: 'Drift Detected', value: driftDetected, change: 3, trend: 'up', description: 'Models exceeding defined drift thresholds.', icon: 'trending-up', color: '#f59e0b' },
            { label: 'Policy Violations', value: policyViolations, change: 12, trend: 'down', description: 'Compliance Breaches Detected.', icon: 'shield-alert', color: '#8b5cf6' },
            { label: 'Guardrail Triggers', value: guardrailTriggers, change: 12, trend: 'down', description: 'Automated Guardrail Interventions.', icon: 'shield', color: '#06b6d4' },
        ],
    };
}

export function generateResponsibleAIIndexData(): ResponsibleAIIndexData {
    const activeItems = active();
    const score = activeItems.length > 0
        ? round(activeItems.reduce((sum, i) => sum + i.responsibleAIScore, 0) / activeItems.length)
        : 0;

    return { score, change: 3.5, changeLabel: 'vs last month' };
}

export function generateModelPerformanceData(): ModelPerformanceData {
    const agents = withAgent();
    const currentAccuracy = agents.length > 0
        ? round(agents.reduce((sum, i) => sum + (i.accuracy ?? 0), 0) / agents.length)
        : 0;
    const currentLatency = agents.length > 0
        ? round(agents.reduce((sum, i) => sum + (i.latency ?? 0), 0) / agents.length, 0)
        : 0;

    return {
        labels: ['W1', 'W2', 'W3', 'W4'],
        accuracy: [90.2, 91.8, 92.8, currentAccuracy],
        latency: [420, 380, 260, currentLatency],
        currentAccuracy,
        accuracyChange: round(currentAccuracy - 92.8),
        currentLatency,
        latencyChange: round(currentLatency - 260, 0),
    };
}

export function generateModelQualityRiskData(): ModelQualityRiskData {
    const agents = withAgent();
    const currentRate = agents.length > 0
        ? round(agents.reduce((sum, i) => sum + (i.hallucinationRate ?? 0), 0) / agents.length)
        : 0;

    return {
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
        hallucinationRates: [3.2, 5.1, 2.8, 4.5, 6.2, currentRate],
        currentRate,
        rateChange: round(currentRate - 6.2),
    };
}

export function generateAIIndexTrendData(): AIIndexTrendData {
    const activeItems = active();
    const currentScore = activeItems.length > 0
        ? round(activeItems.reduce((sum, i) => sum + i.responsibleAIScore, 0) / activeItems.length)
        : 0;

    return {
        labels: ['W1', 'W2', 'W3', 'W4'],
        values: [88.0, 90.5, 88.3, currentScore],
        currentScore,
        change: round(currentScore - 88.3),
        highlightPoint: { index: 2, value: 88.3 },
    };
}

export function generateMonthlyCostData(): MonthlyCostData {
    const activeItems = active();
    const baseCost = activeItems.reduce((sum, i) => sum + i.monthlyCost, 0);
    const jitter = Math.floor(Math.random() * 20000) - 10000;
    const cost = baseCost + jitter;

    return {
        formattedCost: `$${(cost / 1000).toFixed(0)}K`,
        rawCost: cost,
        change: 6,
        changeLabel: 'vs last month',
    };
}

export function generateAttentionQueueData(): AttentionQueueData {
    const alertItems = inventory.filter(i => i.alertType !== null);

    return {
        items: alertItems.map((item, idx) => ({
            id: `aq-${String(idx + 1).padStart(3, '0')}`,
            name: item.agentName ?? item.useCaseName,
            alertType: item.alertType!,
            severity: item.severity as 'Critical' | 'High' | 'Medium' | 'Low',
            status: item.alertStatus!,
            owner: item.owner!,
            detectedTime: item.detectedTime!,
        })),
    };
}

export function generateBehavioralDriftData(): BehavioralDriftData {
    const agents = withAgent();

    return {
        agents: agents.map(i => ({
            name: i.agentName!,
            score: i.driftScore!,
            category: i.driftCategory!,
        })),
    };
}

export function generateRiskScoreBreakdownData(): RiskScoreBreakdownData {
    const agents = withAgent();

    return {
        agents: agents.map(i => ({
            name: i.agentName!,
            criticalAlerts: i.criticalAlerts,
            drift: Math.round(i.driftScore! * 10),
            policyViolations: i.policyViolations,
            guardrailTriggers: i.guardrailTriggers,
        })),
    };
}
