import { ChevronDown } from 'lucide-react';

export function DashboardHeader() {
    return (
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-light text-gray-800 tracking-tight">AI Lifecycle Management Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Centralized view of AI initiatives, governance progress, risk posture, and production readiness across the enterprise.
                </p>
            </div>

            <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center border border-gray-300 rounded-md px-3 py-1.5 bg-white cursor-pointer hover:bg-gray-50">
                    <span className="text-gray-700 mr-2">All Enterprise</span>
                    <ChevronDown size={14} className="text-gray-500" />
                </div>

                <div className="flex bg-gray-200 rounded-full p-0.5">
                    <button className="bg-white rounded-full px-4 py-1 font-medium shadow-sm text-gray-800">
                        Enterprise
                    </button>
                    <button className="rounded-full px-4 py-1 text-gray-500 hover:text-gray-700 font-medium">
                        OMAI
                    </button>
                </div>

                <div className="text-gray-400 text-xs">
                    Last updated: 16 Feb 2026 • 09:42 AM
                </div>
            </div>
        </div>
    );
}
