import {
    LayoutDashboard,
    GraduationCap,
    Users,
    Settings,
    LogOut,
    UserCircle,
    CheckSquare,
    UserCheck,
    Banknote,
    BookOpen
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

interface SidebarItemProps {
    icon: LucideIcon;
    label: string;
    path: string;
}

function SidebarItem({ icon: Icon, label, path }: SidebarItemProps) {
    const location = useLocation();
    // Simple check for active state - exact match or starts with (for nested routes like /students/add)
    const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));

    return (
        <Link
            to={path}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors mt-1",
                active
                    ? "bg-primary/20 text-primary border-r-4 border-primary"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
            )}
        >
            <Icon size={20} />
            <span className="font-medium text-sm">{label}</span>
        </Link>
    );
}

export function Sidebar() {
    const { logout } = useAuth();

    return (
        <div className="h-screen w-64 bg-gray-900 text-white flex flex-col fixed left-0 top-0 shadow-lg">
            <div className="p-6">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold">S</span>
                    </div>
                    SchoolAdmin
                </h1>
            </div>

            <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
                <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Menu</p>
                <SidebarItem icon={LayoutDashboard} label="Dashboard" path="/" />
                <SidebarItem icon={Users} label="Students" path="/students" />
                <SidebarItem icon={BookOpen} label="Classes" path="/classes" />
                <SidebarItem icon={UserCheck} label="Attendance" path="/attendance" />
                <SidebarItem icon={GraduationCap} label="Teachers" path="/teachers" />
                <SidebarItem icon={CheckSquare} label="Teacher Attendance" path="/teachers/attendance" />
                <SidebarItem icon={UserCircle} label="Parents" path="/parents" />
                <SidebarItem icon={Banknote} label="Revenue" path="/revenue" />

                <div className="pt-4 mt-4 border-t border-gray-700">
                    <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">System</p>
                    <SidebarItem icon={Settings} label="Settings" path="/settings" />
                </div>
            </div>

            <div className="p-4 border-t border-gray-800">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg cursor-pointer transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Logout</span>
                </button>
            </div>
        </div>
    );
}
