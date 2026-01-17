import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { storage } from '../../lib/storage';

const COLORS = ['#10B981', '#EF4444'];

export default function MonthlyAttendanceChart() {
    const [data, setData] = useState<{ name: string, value: number }[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const weekly = await storage.getWeeklyStats();
            const totalPresent = weekly.reduce((acc, curr) => acc + curr.present, 0);
            const totalAbsent = weekly.reduce((acc, curr) => acc + curr.absent, 0);

            if (totalPresent === 0 && totalAbsent === 0) {
                setData([
                    { name: 'Present', value: 1 },
                    { name: 'Absent', value: 0 }
                ]);
            } else {
                setData([
                    { name: 'Present', value: totalPresent },
                    { name: 'Absent', value: totalAbsent },
                ]);
            }
        };
        loadData();
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-6">Monthly Attendance</h3>
            <div className="h-80 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value: string) => <span className="text-gray-600 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                </ResponsiveContainer>
                {/* Center Text */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none mb-8">
                    <p className="text-gray-400 text-sm font-medium">Average</p>
                    <p className="text-2xl font-bold text-gray-800">
                        {data.length > 0 && (data[0].value + data[1].value) > 0
                            ? `${Math.round((data[0].value / (data[0].value + data[1].value)) * 100)}%`
                            : '0%'}
                    </p>
                </div>
            </div>
        </div>
    );
}
