import { Cpu, FlaskConical, Rocket, CheckCircle2, Archive } from 'lucide-react';

export function KpiCardRow() {
    return (
        <div className="grid grid-cols-5 gap-4 mb-6">
            {/* Total Use Cases (Dark Card) */}
            <div className="bg-[#00112c] text-white rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                <div className="flex space-x-2 items-center text-gray-300">
                    <Cpu size={18} />
                </div>
                <div>
                    <div className="text-4xl font-semibold mb-1">1,440</div>
                    <div className="text-[15px] font-medium">Total AI Use Cases</div>
                    <div className="text-xs text-gray-400 mt-0.5">100% of the portfolio</div>
                </div>
            </div>

            {/* POC Card */}
            <div className="bg-[#f8f9fa] border border-gray-200 text-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                <div className="text-gray-500">
                    <FlaskConical size={18} />
                </div>
                <div>
                    <div className="text-4xl font-semibold text-[#0052cc] mb-1">600</div>
                    <div className="text-[15px] font-medium text-gray-700">POC</div>
                    <div className="text-xs text-gray-500 mt-0.5">41.7% of the portfolio</div>
                </div>
            </div>

            {/* Pilot Card */}
            <div className="bg-[#f8f9fa] border border-gray-200 text-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                <div className="text-gray-500">
                    <Rocket size={18} />
                </div>
                <div>
                    <div className="text-4xl font-semibold text-[#0052cc] mb-1">360</div>
                    <div className="text-[15px] font-medium text-gray-700">Pilot</div>
                    <div className="text-xs text-gray-500 mt-0.5">25.0% of the portfolio</div>
                </div>
            </div>

            {/* Production Card */}
            <div className="bg-[#f8f9fa] border border-gray-200 text-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                <div className="text-gray-500">
                    <CheckCircle2 size={18} />
                </div>
                <div>
                    <div className="text-4xl font-semibold text-[#0052cc] mb-1">240</div>
                    <div className="text-[15px] font-medium text-gray-700">Production</div>
                    <div className="text-xs text-gray-500 mt-0.5">16.7% of the portfolio</div>
                </div>
            </div>

            {/* Archived Card */}
            <div className="bg-[#f8f9fa] border border-gray-200 text-gray-800 rounded-xl p-5 shadow-sm flex flex-col justify-between h-32">
                <div className="text-gray-500">
                    <Archive size={18} />
                </div>
                <div>
                    <div className="text-4xl font-semibold text-[#0052cc] mb-1">240</div>
                    <div className="text-[15px] font-medium text-gray-700">Archived</div>
                    <div className="text-xs text-gray-500 mt-0.5">16.7% of the portfolio</div>
                </div>
            </div>
        </div>
    );
}
