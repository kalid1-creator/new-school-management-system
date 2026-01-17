import { useEffect, useState } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { storage } from '../../lib/storage';

import { useNavigate } from 'react-router-dom';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color: 'purple' | 'green' | 'red';
    trend: string;
    onClick?: () => void;
}

function StatCard({ title, value, icon: Icon, color, trend, onClick }: StatCardProps) {
    const colorStyles = {
        purple: "bg-purple-100 text-purple-600",
        green: "bg-green-100 text-green-600",
        red: "bg-red-100 text-red-600"
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md",
                onClick && "cursor-pointer hover:border-gray-200 active:scale-[0.99]"
            )}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
                </div>
                <div className={cn("p-3 rounded-xl", colorStyles[color])}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
                <span className="text-green-500 font-medium">{trend}</span>
            </div>
        </div>
    );
}

export default function StatsCards() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        presentToday: 0,
        absentToday: 0
    });

    useEffect(() => {
        const loadStats = async () => {
            const students = await storage.getStudents();
            const today = new Date().toISOString().split('T')[0];
            const dailyStats = await storage.getDailyStats(today);

            setStats({
                totalStudents: students.length,
                presentToday: dailyStats.present,
                absentToday: dailyStats.absent
            });
        };

        loadStats();
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
                title="Total Students"
                value={stats.totalStudents}
                icon={Users}
                color="purple"
                trend={stats.totalStudents > 0 ? "+ from last month" : "No data"}
                onClick={() => navigate('/students')}
            />
            <StatCard
                title="Present Today"
                value={stats.presentToday}
                icon={UserCheck}
                color="green"
                trend={stats.totalStudents > 0 ? `${Math.round((stats.presentToday / stats.totalStudents) * 100)}% attendance` : "No data"}
                onClick={() => navigate('/attendance?status=Present')}
            />
            <StatCard
                title="Absent Today"
                value={stats.absentToday}
                icon={UserX}
                color="red"
                trend={stats.totalStudents > 0 ? `${Math.round((stats.absentToday / stats.totalStudents) * 100)}% absentee rate` : "No data"}
                onClick={() => navigate('/attendance?status=Absent')}
            />
        </div>
    );
}
