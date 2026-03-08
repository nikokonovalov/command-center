import { FlaskConical, Rocket, CheckCircle2, Info, AlertTriangle, AlertCircle } from 'lucide-react';

export function TimelineOverviewCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm col-span-2 h-64 flex flex-col justify-between">
            <div>
                <h3 className="text-[17px] text-gray-800 font-normal">Lifecycle Stage Timeline Overview</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Average time spent in each lifecycle stage compared to expected approval timelines.</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
                {/* POC Timeline */}
                <div className="bg-[#f0f2f5] rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center text-gray-700 font-medium mb-3">
                        <FlaskConical size={16} className="mr-2" /> POC
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                        <div>
                            <div className="text-gray-500">Average Duration</div>
                            <div className="font-semibold text-gray-800">18 days</div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-500">Expected SLA</div>
                            <div className="font-medium text-gray-800">18 days</div>
                        </div>
                    </div>
                    <div className="flex items-center text-[#d97706] bg-[#fef3c7] text-xs font-medium px-2 py-1 rounded w-fit border border-[#fcd34d]">
                        <AlertTriangle size={14} className="mr-1" /> At SLA Limit
                    </div>
                </div>

                {/* Pilot Timeline */}
                <div className="bg-white rounded-lg p-4 border border-red-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
                    <div className="flex items-center justify-between text-gray-700 font-medium mb-3">
                        <div className="flex items-center">
                            <Rocket size={16} className="mr-2 text-red-500" /> Pilot
                        </div>
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                        <div>
                            <div className="text-gray-500">Average Duration</div>
                            <div className="font-bold text-red-600">30 days</div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-500">Expected SLA</div>
                            <div className="font-medium text-gray-800">25 days</div>
                        </div>
                    </div>
                    <div className="flex items-center text-red-600 bg-red-50 text-xs font-medium px-2 py-1 rounded w-fit border border-red-200">
                        <AlertCircle size={14} className="mr-1" /> SLA Breached
                    </div>
                </div>

                {/* Production Timeline */}
                <div className="bg-[#f0f2f5] rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center text-gray-700 font-medium mb-3">
                        <CheckCircle2 size={16} className="mr-2" /> Production
                    </div>
                    <div className="flex justify-between text-xs mb-3">
                        <div>
                            <div className="text-gray-500">Average Duration</div>
                            <div className="font-semibold text-gray-800">14 days</div>
                        </div>
                        <div className="text-right">
                            <div className="text-gray-500">Expected SLA</div>
                            <div className="font-medium text-gray-800">15 days</div>
                        </div>
                    </div>
                    <div className="flex items-center text-green-700 bg-green-50 text-xs font-medium px-2 py-1 rounded w-fit border border-green-200">
                        <CheckCircle2 size={14} className="mr-1" /> On Track
                    </div>
                </div>
            </div>

            <div className="bg-gray-200/60 rounded-lg p-3 mt-4 flex items-center text-xs text-gray-600">
                <Info size={14} className="mr-2 text-gray-500 shrink-0" />
                <span>Pilot stage is breaching SLA, POC is at risk, while Ideation and Production remain healthy.</span>
            </div>
        </div>
    );
}
