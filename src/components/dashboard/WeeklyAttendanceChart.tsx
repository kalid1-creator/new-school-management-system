import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { storage } from '../../lib/storage';

export default function WeeklyAttendanceChart() {
    const [data, setData] = useState<{ name: string, present: number, absent: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const stats = await storage.getWeeklyStats();
            setData(stats);
        };
        loadData();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-800">Weekly Attendance</h3>
                <select className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 text-sm text-gray-600 outline-none focus:border-purple-500">
                    <option>This Week</option>
                    <option>Last Week</option>
                </select>
            </div>

            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barGap={8}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#6B7280', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#F9FAFB' }}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Bar dataKey="present" fill="#8B5CF6" radius={[4, 4, 0, 0]} barSize={32} name="Present" />
                        <Bar dataKey="absent" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} name="Absent" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
