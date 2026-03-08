import { ArrowUpRight } from 'lucide-react';

export function QuarterlyGrowthCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm col-span-1 h-44 flex flex-col justify-between">
            <div>
                <h3 className="text-[17px] text-gray-800 font-normal">Production Growth (Quarter)</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Quarterly increase in AI production deployments.</p>
            </div>

            <div className="flex items-end justify-between mt-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-light text-gray-800">+12%</span>
                    <div className="flex items-center bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">
                        214 → 240
                    </div>
                </div>
                {/* Placeholder for small sparkline chart */}
                <div className="w-16 h-12 flex items-end">
                    <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                        <path d="M0,40 Q25,45 50,30 T100,0" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
                        <circle cx="100" cy="0" r="4" fill="#22c55e" />
                        {/* Shaded area under curve */}
                        <path d="M0,40 Q25,45 50,30 T100,0 L100,50 L0,50 Z" fill="rgba(34, 197, 94, 0.1)" stroke="none" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
