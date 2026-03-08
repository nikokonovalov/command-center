import { AlertTriangle } from 'lucide-react';

export function BottlenecksCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm h-64 flex flex-col">
            <div className="mb-4">
                <h3 className="text-[17px] text-gray-800 font-normal">Bottlenecks & Escalations</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">AI use cases flagged for delays, governance, or approval risks.</p>
            </div>

            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                <div className="text-center flex flex-col items-center">
                    <AlertTriangle size={24} className="text-gray-300 mb-2" />
                    <span className="text-sm font-medium">No critical escalations</span>
                    <span className="text-xs">All processes are currently within thresholds.</span>
                </div>
            </div>
        </div>
    );
}
