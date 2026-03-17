import { lazy, type ComponentType } from 'react';
import type { WidgetDataSource } from '@command-center/types';

/**
 * Props every widget component receives.
 * Widgets are "dumb" — they get a dataSource config and render accordingly.
 */
export interface WidgetProps {
    dataSource: WidgetDataSource;
}

/**
 * The Widget Registry maps widget type strings (from the dashboard config)
 * to lazily-loaded React components.
 *
 * ┌──────────────────────────────────────────────────────────────────┐
 * │  TO ADD A NEW WIDGET:                                            │
 * │  1. Create your widget in src/widgets/{dashboard}/{Widget}.tsx   │
 * │  2. Add ONE line to this registry                                │
 * │  That's it! The engine handles everything else.                  │
 * └──────────────────────────────────────────────────────────────────┘
 */
export const WidgetRegistry: Record<string, React.LazyExoticComponent<ComponentType<WidgetProps>>> = {
    // ── AI Lifecycle Management ──
    'lifecycle-kpi': lazy(() => import('@/widgets/ai-lifecycle/LifecycleKpi.tsx')),
    'production-growth': lazy(() => import('@/widgets/ai-lifecycle/ProductionGrowth.tsx')),
    'approval-time': lazy(() => import('@/widgets/ai-lifecycle/ApprovalTime.tsx')),
    'lifecycle-funnel': lazy(() => import('@/widgets/ai-lifecycle/LifecycleFunnel.tsx')),
    'stage-timeline': lazy(() => import('@/widgets/ai-lifecycle/StageTimeline.tsx')),
    'bottlenecks': lazy(() => import('@/widgets/ai-lifecycle/Bottlenecks.tsx')),
    'onboarding-tracker': lazy(() => import('@/widgets/ai-lifecycle/OnboardingTracker.tsx')),
    'use-cases-by-bu': lazy(() => import('@/widgets/ai-lifecycle/UseCasesByBU.tsx')),
    'approval-status': lazy(() => import('@/widgets/ai-lifecycle/ApprovalStatus.tsx')),
    'tech-distribution': lazy(() => import('@/widgets/ai-lifecycle/TechDistribution.tsx')),

    // ── AI Risk & Compliance ──
    'risk-stats': lazy(() => import('@/widgets/ai-risk/RiskStats.tsx')),
    'live-risk-events': lazy(() => import('@/widgets/ai-risk/LiveRiskEvents.tsx')),
    'responsible-ai-index': lazy(() => import('@/widgets/ai-risk/ResponsibleAIIndex.tsx')),
    'model-performance': lazy(() => import('@/widgets/ai-risk/ModelPerformance.tsx')),
    'model-quality-risk': lazy(() => import('@/widgets/ai-risk/ModelQualityRisk.tsx')),
    'ai-index-trend': lazy(() => import('@/widgets/ai-risk/AIIndexTrend.tsx')),
    'monthly-cost': lazy(() => import('@/widgets/ai-risk/MonthlyCost.tsx')),
    'attention-queue': lazy(() => import('@/widgets/ai-risk/AttentionQueue.tsx')),
    'behavioral-drift': lazy(() => import('@/widgets/ai-risk/BehavioralDrift.tsx')),
    'risk-score-breakdown': lazy(() => import('@/widgets/ai-risk/RiskScoreBreakdown.tsx')),
};
