import { RefreshCcw, Calendar } from 'lucide-react';

export function TopBar() {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 pb-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
                <p className="text-gray-500 font-medium mt-1">Welcome back, Admin</p>
            </div>

            <div className="flex items-center gap-4 mt-4 md:mt-0">
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-gray-700">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="font-medium text-sm">January</span>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 text-gray-700">
                    <span className="font-medium text-sm">2026</span>
                </div>

                <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-all active:scale-95">
                    <RefreshCcw size={16} />
                    <span className="font-medium text-sm">Refresh</span>
                </button>
            </div>
        </div>
    );
}
