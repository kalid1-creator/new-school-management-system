import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Phone, Hash, GraduationCap, Banknote, Clock, PieChart } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Student } from '../types/student';
import { MONTHS } from '../types/payment';

interface AttendanceStat {
    present: number;
    absent: number;
}

export default function StudentDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [student, setStudent] = useState<Student | null>(null);

    // New State for Enhancements
    const [feePaid, setFeePaid] = useState(false);
    const [recentAttendance, setRecentAttendance] = useState<{ date: string; status: string }[]>([]);
    const [lastMonthStats, setLastMonthStats] = useState<AttendanceStat>({ present: 0, absent: 0 });

    useEffect(() => {
        if (id) {
            const loadData = async () => {
                const data = await storage.getStudent(id);
                if (data) {
                    setStudent(data);
                    await loadEnhancements(id);
                } else {
                    alert('Student not found');
                    navigate('/students');
                }
            };
            loadData();
        }
    }, [id, navigate]);

    const loadEnhancements = async (studentId: string) => {
        const now = new Date();
        const currentMonth = MONTHS[now.getMonth()];
        const currentYear = now.getFullYear().toString();

        // 1. Fee Status
        const payments = await storage.getPayments();
        const isPaid = payments.some(p =>
            p.studentId === studentId &&
            p.month === currentMonth &&
            p.year === currentYear
        );
        setFeePaid(isPaid);

        // 2. Last 7 Days Attendance
        const attendanceRecords = await storage.getAttendance();
        const studentRecords = attendanceRecords.filter(r => r.studentId === studentId);

        const history: { date: string; status: string }[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const record = studentRecords.find(r => r.date === dateStr);
            const dayOfWeek = d.getDay();

            if (record) {
                history.push({ date: dateStr, status: record.status });
            } else if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                history.push({ date: dateStr, status: 'Present' });
            }
        }
        setRecentAttendance(history.reverse());

        // 3. Last Month Summary
        const prevMonthDate = new Date();
        prevMonthDate.setMonth(prevMonthDate.getMonth() - 1);
        const queryYear = prevMonthDate.getFullYear();
        const queryMonthIdx = prevMonthDate.getMonth();

        const prevMonthRecords = studentRecords.filter(r => {
            const rDate = new Date(r.date);
            return rDate.getMonth() === queryMonthIdx && rDate.getFullYear() === queryYear;
        });

        const absent = prevMonthRecords.filter(r => r.status === 'Absent').length;
        const present = prevMonthRecords.filter(r => r.status === 'Present').length;
        setLastMonthStats({ present, absent });
    };

    if (!student) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    const currentMonthName = MONTHS[new Date().getMonth()];
    const currentYearVal = new Date().getFullYear();

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/students')} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-medium">Back to Students</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{student.fullName}</h2>
                        <p className="text-purple-600 font-medium mt-1">ID: {student.id}</p>
                    </div>
                    <div className="bg-white p-3 rounded-full border border-gray-100 shadow-sm">
                        <User size={32} className="text-purple-600" />
                    </div>
                </div>

                <div className="p-8 space-y-8">
                    {/* Fee Status Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                            <Banknote size={20} className="text-gray-400" />
                            Fee Status
                        </h3>
                        <div className="bg-gray-50 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Period</p>
                                <p className="font-medium text-gray-800 text-lg">{currentMonthName} {currentYearVal}</p>
                            </div>
                            <div className={`px-6 py-2 rounded-full font-bold text-sm border ${feePaid
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-red-100 text-red-700 border-red-200'
                                }`}>
                                {feePaid ? 'PAID' : 'NOT PAID'}
                            </div>
                        </div>
                    </div>

                    {/* Attendance Enhancements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Last 7 Days */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <Clock size={20} className="text-gray-400" />
                                Last 7 Days
                            </h3>
                            <div className="space-y-3">
                                {recentAttendance.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No recent data.</p>
                                ) : (
                                    recentAttendance.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <span className="text-gray-600 text-sm font-medium">{item.date}</span>
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${item.status === 'Present'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Last Month Summary */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                <PieChart size={20} className="text-gray-400" />
                                Last Month Summary
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-center">
                                    <p className="text-green-800 text-2xl font-bold">{lastMonthStats.present}</p>
                                    <p className="text-green-600 text-xs font-medium uppercase tracking-wide mt-1">Present Days</p>
                                </div>
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
                                    <p className="text-red-800 text-2xl font-bold">{lastMonthStats.absent}</p>
                                    <p className="text-red-600 text-xs font-medium uppercase tracking-wide mt-1">Absent Days</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="text-gray-800 font-medium">{student.gender}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Date of Birth</p>
                                    <p className="text-gray-800 font-medium">{student.dob}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <GraduationCap size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Grade</p>
                                    <p className="text-gray-800 font-medium">{student.grade}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parent Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">Parent Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Parent Name</p>
                                    <p className="text-gray-800 font-medium">{student.parentName}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Parent Phone</p>
                                    <p className="text-gray-800 font-medium">{student.parentPhone}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-100 pb-2">System Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                    <Hash size={20} />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Record Created At</p>
                                    <p className="text-gray-800 font-medium">{new Date(student.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
