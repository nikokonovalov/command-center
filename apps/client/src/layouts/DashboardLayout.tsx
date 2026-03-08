import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, BarChart3, Users, Settings, Bell } from 'lucide-react';

const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-border-subtle bg-bg-secondary">
                <div className="flex items-center gap-3 border-b border-border-subtle px-5 py-6">
                    <div className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-gradient-to-br from-gradient-start to-gradient-end">
                        <LayoutDashboard size={18} color="white" />
                    </div>
                    <h1 className="bg-gradient-to-br from-gradient-start to-gradient-end bg-clip-text text-[1.1rem] font-bold text-transparent">
                        Command Center
                    </h1>
                </div>

                <nav className="flex-1 overflow-y-auto px-3 py-4">
                    {navItems.map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[0.875rem] font-medium transition-all duration-150 ${isActive
                                    ? 'bg-accent-indigo/10 text-accent-indigo'
                                    : 'text-text-secondary hover:bg-bg-card hover:text-text-primary'
                                }`
                            }
                        >
                            <Icon size={18} />
                            {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="border-t border-border-subtle px-3 py-4">
                    <div className="flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-[0.875rem] font-medium text-text-secondary transition-all duration-150 hover:bg-bg-card hover:text-text-primary">
                        <div className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-gradient-to-br from-[#6366f1] to-[#ec4899] text-[0.7rem] font-bold text-white">
                            NK
                        </div>
                        <span className="text-[0.8rem]">Niko K.</span>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-[260px] flex-1">
                {/* Top bar */}
                <div className="flex items-center justify-between border-b border-border-subtle bg-[#0a0a0f]/80 px-8 py-4 backdrop-blur-md sticky top-0 z-40">
                    <div>
                        <h2 className="text-[1.4rem] font-bold tracking-tight">Dashboard</h2>
                        <p className="mt-0.5 text-[0.8rem] text-text-muted">Welcome back! Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="relative cursor-pointer rounded-[10px] border border-border-subtle bg-bg-card p-2 text-text-secondary hover:text-text-primary hover:border-border transition-colors">
                            <Bell size={18} />
                            <span className="absolute right-1 top-1 h-[7px] w-[7px] rounded-full bg-accent-rose" />
                        </button>
                    </div>
                </div>

                {/* Page content */}
                <div className="p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
