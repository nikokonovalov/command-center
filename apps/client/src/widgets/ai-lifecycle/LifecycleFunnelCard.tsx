import { Info } from 'lucide-react';

export function LifecycleFunnelCard() {
    return (
        <div className="bg-[#f8f9fa] border border-gray-200 rounded-xl p-5 shadow-sm col-span-1 row-span-2 flex flex-col h-full">
            <div>
                <h3 className="text-[17px] text-gray-800 font-normal">AI Lifecycle Funnel</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">Visualizes movement from Total AI Use Cases to Production and stage conversion rates.</p>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center py-4 relative">
                {/* CSS/SVG Funnel Visualization */}
                <div className="w-full max-w-[280px] space-y-[2px] relative z-10">
                    {/* Level 1: Total */}
                    <div className="relative w-full h-14 bg-[#003b70] flex items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}>
                        <div className="text-center leading-tight">
                            <div className="text-xs font-semibold">Total</div>
                            <div className="text-[10px]">AI Use Cases</div>
                        </div>
                    </div>
                    {/* Level 2: POC */}
                    <div className="relative w-[80%] mx-auto h-12 bg-[#0052cc] flex items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}>
                        <div className="text-center leading-tight">
                            <div className="text-xs font-semibold">POC</div>
                        </div>
                    </div>
                    {/* Level 3: Pilot */}
                    <div className="relative w-[56%] mx-auto h-10 bg-[#3377dd] flex items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}>
                        <div className="text-center leading-tight">
                            <div className="text-xs font-semibold">Pilot</div>
                        </div>
                    </div>
                    {/* Level 4: Production */}
                    <div className="relative w-[28%] mx-auto h-10 bg-[#0ea5e9] flex items-center justify-center text-white"
                        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%, 50% 100%)' }}>
                        <div className="text-center leading-tight pt-1">
                            <div className="text-[9px] font-semibold">Production</div>
                        </div>
                    </div>
                </div>

                {/* Conversion Rate Labels (Absolute positioned relative to the funnel container) */}
                <div className="absolute right-0 top-[20%] text-xs text-gray-600">
                    <div className="font-semibold text-gray-800">41.7%</div>
                    <div className="text-[10px]">Transition Rate to POC</div>
                </div>
                <div className="absolute right-0 top-[50%] text-xs text-gray-600">
                    <div className="font-semibold text-gray-800">60%</div>
                    <div className="text-[10px]">Transition Rate to Pilot</div>
                </div>
                <div className="absolute right-0 top-[75%] text-xs text-gray-600">
                    <div className="font-semibold text-gray-800">66.7%</div>
                    <div className="text-[10px]">Transition Rate to Production</div>
                </div>
            </div>

            <div className="bg-gray-200/60 rounded-lg p-3 mt-4 flex items-start text-xs text-gray-600">
                <Info size={14} className="mr-2 mt-0.5 text-gray-500 shrink-0" />
                <span>66.7% AI Use Cases are to production transition</span>
            </div>
        </div>
    );
}
