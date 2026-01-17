import StatsCards from '../components/dashboard/StatsCard';
import WeeklyAttendanceChart from '../components/dashboard/WeeklyAttendanceChart';
import MonthlyAttendanceChart from '../components/dashboard/MonthlyAttendanceChart';
import { MonthlyRevenueChart } from '../components/dashboard/RevenueChart';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <StatsCards />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <WeeklyAttendanceChart />
                <MonthlyAttendanceChart />
            </div>

            {/* Revenue Row */}
            <MonthlyRevenueChart />
        </div>
    );
}
