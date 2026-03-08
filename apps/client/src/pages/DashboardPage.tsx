import { DashboardHeader } from '@/widgets/ai-lifecycle/DashboardHeader';
import { KpiCardRow } from '@/widgets/ai-lifecycle/KpiCardRow';
import { QuarterlyGrowthCard } from '@/widgets/ai-lifecycle/QuarterlyGrowthCard';
import { ApprovalTimeCard } from '@/widgets/ai-lifecycle/ApprovalTimeCard';
import { LifecycleFunnelCard } from '@/widgets/ai-lifecycle/LifecycleFunnelCard';
import { TimelineOverviewCard } from '@/widgets/ai-lifecycle/TimelineOverviewCard';
import { BottlenecksCard } from '@/widgets/ai-lifecycle/BottlenecksCard';
import { OnboardingTrackerCard } from '@/widgets/ai-lifecycle/OnboardingTrackerCard';

export default function DashboardPage() {
    return (
        <div className="w-full max-w-[1400px] mx-auto pb-10">
            <DashboardHeader />
            <KpiCardRow />

            {/* Middle and Timeline Section */}
            <div className="grid grid-cols-3 gap-6 mb-6">
                {/* Left 2 columns containing Stats and Timeline */}
                <div className="col-span-2 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-6">
                        <QuarterlyGrowthCard />
                        <ApprovalTimeCard />
                    </div>
                    <TimelineOverviewCard />
                </div>

                {/* Right 1 column containing the tall Funnel */}
                <div className="col-span-1">
                    <LifecycleFunnelCard />
                </div>
            </div>

            {/* Bottom Sections */}
            <div className="grid grid-cols-2 gap-6">
                <BottlenecksCard />
                <OnboardingTrackerCard />
            </div>
        </div>
    );
}
