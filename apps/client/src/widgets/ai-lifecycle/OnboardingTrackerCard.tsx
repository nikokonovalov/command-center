import { Activity } from 'lucide-react';

export function OnboardingTrackerCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col">
            <div className="mb-4">
                <h3 className="text-[17px] text-gray-800 font-normal">AI Use Cases Onboarding Tracker</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">AI use cases progressing through the required onboarding and approval workflow.</p>
            </div>

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                <div className="text-center flex flex-col items-center">
                    <Activity size={24} className="text-gray-300 mb-2" />
                    <span className="text-sm font-medium">Workflow Tracker Data</span>
                    <span className="text-xs">Visualizing stages of onboarding...</span>
                </div>
            </div>
        </div>
    );
}
