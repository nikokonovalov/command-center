import type { DashboardConfig } from '@command-center/types';

/**
 * Static fallback dashboard configs.
 * Used when the API server is unreachable during development.
 */
export const defaultDashboardConfig: DashboardConfig = {
    id: 'ai-lifecycle',
    name: 'AI Lifecycle Management Dashboard',
    description: 'Centralized view of AI initiatives, governance progress, risk posture, and production readiness.',
    widgets: [
        { id: 'lifecycle-kpi', type: 'lifecycle-kpi', title: '', layout: { colSpan: 10, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/lifecycle-kpi/data', staleTime: 30000 } },
        { id: 'production-growth', type: 'production-growth', title: 'Production Growth (Quarter)', description: 'Quarterly increase in AI production deployments.', layout: { colSpan: 3, rowSpan: 2 }, dataSource: { type: 'socket', socketEvent: 'production-growth-update' } },
        { id: 'approval-time', type: 'approval-time', title: 'Average Approval Time', description: 'Average AI approval cycle time.', layout: { colSpan: 3, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/approval-time/data', staleTime: 60000 } },
        { id: 'lifecycle-funnel', type: 'lifecycle-funnel', title: 'AI Lifecycle Funnel', description: 'Conversion rates from ideation through pilot to production deployment.', layout: { colSpan: 4, rowSpan: 5 }, dataSource: { type: 'rest', endpoint: '/api/widgets/lifecycle-funnel/data', staleTime: 60000 } },
        { id: 'stage-timeline', type: 'stage-timeline', title: 'Lifecycle Stage Timeline Overview', description: 'Average time spent in each lifecycle stage compared to expected approval timelines.', layout: { colSpan: 6, rowSpan: 1 }, dataSource: { type: 'rest', endpoint: '/api/widgets/stage-timeline/data', staleTime: 60000 } },
        { id: 'bottlenecks', type: 'bottlenecks', title: 'Bottlenecks & Escalations', description: 'Active escalations and SLA breaches requiring immediate attention.', layout: { colSpan: 5, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/bottlenecks/data', staleTime: 60000 } },
        { id: 'onboarding-tracker', type: 'onboarding-tracker', title: 'AI Use Cases Onboarding Tracker', description: 'Current backlog of AI use cases pending approval across governance bodies.', layout: { colSpan: 5, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/onboarding-tracker/data', staleTime: 60000 } },
        { id: 'use-cases-by-bu', type: 'use-cases-by-bu', title: 'Use Cases by Business Unit', description: 'Distribution of AI initiatives across enterprise business units.', layout: { colSpan: 5, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/use-cases-by-bu/data', staleTime: 60000 } },
        { id: 'approval-status', type: 'approval-status', title: 'Approval Status', description: 'AI governance approval across review stages.', layout: { colSpan: 2, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/approval-status/data', staleTime: 60000 } },
        { id: 'tech-distribution', type: 'tech-distribution', title: 'AI Technology Distribution', description: 'Distribution of AI technologies deployed in production vs. pilot stages.', layout: { colSpan: 3, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/tech-distribution/data', staleTime: 60000 } },
    ],
};

export const defaultRiskDashboardConfig: DashboardConfig = {
    id: 'ai-risk',
    name: 'AI Risk & Compliance Dashboard',
    description: 'Real-time visibility into AI models and agents across the enterprise.',
    widgets: [
        { id: 'risk-stats-use-cases', type: 'risk-stats', title: '', layout: { colSpan: 2, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/risk-stats/data?index=0', staleTime: 30000 } },
        { id: 'risk-stats-agents', type: 'risk-stats', title: '', layout: { colSpan: 2, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/risk-stats/data?index=1', staleTime: 30000 } },
        { id: 'live-risk-events', type: 'live-risk-events', title: 'Live Risk Events', description: 'Real-time view of AI alerts, model drift, guardrail triggers, and policy violations across the enterprise.', layout: { colSpan: 6, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/live-risk-events/data', staleTime: 30000 } },
        { id: 'responsible-ai-index', type: 'responsible-ai-index', title: 'Responsible AI Index', description: 'Enterprise-wide AI health and risk score.', icon: 'shield-check', layout: { colSpan: 2, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/responsible-ai-index/data', staleTime: 60000 } },
        { id: 'model-performance', type: 'model-performance', title: 'Model Performance Metrics', description: 'Operational performance trends: Accuracy & Latency gains.', layout: { colSpan: 4, rowSpan: 5 }, dataSource: { type: 'rest', endpoint: '/api/widgets/model-performance/data', staleTime: 60000 } },
        { id: 'model-quality-risk', type: 'model-quality-risk', title: 'Model Quality & Risk', description: 'Hallucination rates and factual accuracy degradation metrics for active agents.', layout: { colSpan: 4, rowSpan: 5 }, dataSource: { type: 'rest', endpoint: '/api/widgets/model-quality-risk/data', staleTime: 60000 } },
        { id: 'ai-index-trend', type: 'ai-index-trend', title: 'Responsible AI Index Trend', description: 'Historical progression of the enterprise Responsible AI score.', layout: { colSpan: 2, rowSpan: 3 }, dataSource: { type: 'rest', endpoint: '/api/widgets/ai-index-trend/data', staleTime: 60000 } },
        { id: 'monthly-cost', type: 'monthly-cost', title: 'Monthly AI Cost', description: 'Total enterprise AI infrastructure and model operational cost.', icon: 'circle-dollar', layout: { colSpan: 2, rowSpan: 2 }, dataSource: { type: 'rest', endpoint: '/api/widgets/monthly-cost/data', staleTime: 30000 } },
        { id: 'attention-queue', type: 'attention-queue', title: 'Top AI Attention Queue', description: 'Prioritized queue of AI incidents, drift alerts, and policy violations requiring immediate investigation.', layout: { colSpan: 8, rowSpan: 5 }, dataSource: { type: 'rest', endpoint: '/api/widgets/attention-queue/data', staleTime: 30000 } },
        { id: 'behavioral-drift', type: 'behavioral-drift', title: 'Behavioral Drift Monitoring', description: 'Real-time drift deviation across production agents.', layout: { colSpan: 4, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/behavioral-drift/data', staleTime: 60000 } },
        { id: 'risk-score-breakdown', type: 'risk-score-breakdown', title: 'Agent Risk Score Breakdown', description: 'Component breakdown of risk scores for highest-risk agents.', layout: { colSpan: 6, rowSpan: 4 }, dataSource: { type: 'rest', endpoint: '/api/widgets/risk-score-breakdown/data', staleTime: 60000 } },
    ],
};
