import { ArrowDown } from 'lucide-react';

export function ApprovalTimeCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm col-span-1 h-44 flex justify-between">
            <div className="flex flex-col justify-between h-full w-[60%]">
                <div>
                    <h3 className="text-[17px] text-gray-800 font-normal">Average Approval Time</h3>
                    <p className="text-[13px] text-gray-500 mt-0.5">Average AI approval cycle time.</p>
                </div>

                <div>
                    <div className="flex items-center text-[#0052cc] text-xs font-medium bg-[#e6f0ff] w-fit px-2 py-1 rounded">
                        <ArrowDown size={14} className="mr-1" />
                        2 days vs last Quarter
                    </div>
                    <div className="text-xs text-gray-600 mt-2 font-medium">
                        Status: <span className="text-gray-800 font-semibold">Within SLA</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-center w-[40%]">
                <div className="relative w-20 h-20">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                        {/* Background track */}
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" />
                        {/* Progress */}
                        <circle
                            cx="50" cy="50" r="40"
                            fill="none"
                            stroke="#0052cc"
                            strokeWidth="12"
                            strokeDasharray="251.2"
                            strokeDashoffset="62.8" /* 75% fill */
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-center leading-none">
                        <span className="text-lg font-bold text-gray-800">18</span>
                        <span className="text-[10px] text-gray-500 font-medium">days</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
