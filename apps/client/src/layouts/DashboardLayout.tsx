import { Outlet, NavLink } from 'react-router-dom';
import { Bell } from 'lucide-react';

const subNavItems = [
    { to: '/dashboard', label: 'AI Lifecycle Management' },
    { to: '/risk', label: 'AI Risk & Compliance' },
];

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen flex-col bg-[#f0f2f5]">
            {/* Global Header */}
            <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm z-50">
                <div className="flex items-center gap-3">
                    <div className="flex font-bold text-xl tracking-tight text-[#003b70] items-center">
                        <span className="text-red-500 mr-1 text-2xl leading-none">citi</span>
                        <span className="text-gray-400 font-light mx-2">|</span>
                        <span className="text-gray-700 font-medium text-lg">AI Command Center</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative cursor-pointer rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors">
                        <Bell size={20} />
                        <span className="absolute right-2 top-2 h-[8px] w-[8px] rounded-full border-2 border-white bg-red-500" />
                    </button>
                    <div className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-gray-200 text-[0.8rem] font-medium text-gray-600">
                        SC
                    </div>
                </div>
            </header>

            {/* Sub-Navigation */}
            <nav className="flex items-end gap-2 bg-[#00112c] px-6 pt-3 h-12 text-sm z-40">
                {subNavItems.map(({ to, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `rounded-t-lg px-4 py-2 font-medium transition-colors ${isActive
                                ? 'bg-[#f0f2f5] text-[#00112c]'
                                : 'text-gray-300 hover:text-white hover:bg-white/10'
                            }`
                        }
                    >
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* Main content */}
            <main className="flex-1 p-6 md:p-8">
                <Outlet />
            </main>
        </div>
    );
}
