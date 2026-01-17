import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, GraduationCap, Calendar } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Teacher } from '../types/teacher';

export default function TeacherDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState<Teacher | null>(null);
    const [lastMonthStats, setLastMonthStats] = useState({ present: 0, absent: 0 });

    const loadEnhancements = async (teacherId: string) => {
        const attendanceRecords = await storage.getTeacherAttendance();
        const teacherRecords = attendanceRecords.filter(r => r.studentId === teacherId);

        // Attendance stats for summary
        const now = new Date();
        const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const queryYear = prevMonthDate.getFullYear();
        const queryMonthIdx = prevMonthDate.getMonth();

        const prevMonthRecords = teacherRecords.filter(r => {
            const rDate = new Date(r.date);
            return rDate.getMonth() === queryMonthIdx && rDate.getFullYear() === queryYear;
        });

        const absent = prevMonthRecords.filter(r => r.status === 'Absent').length;
        const present = prevMonthRecords.filter(r => r.status === 'Present').length;

        setLastMonthStats({ present, absent });
    };

    useEffect(() => {
        if (id) {
            const loadData = async () => {
                const teachers = await storage.getTeachers();
                const foundTeacher = teachers.find(t => t.id === id);
                if (foundTeacher) {
                    setTeacher(foundTeacher);
                    await loadEnhancements(id);
                } else {
                    setTeacher(null);
                    setLastMonthStats({ present: 0, absent: 0 });
                }
            };
            loadData();
        } else {
            setTeacher(null);
            setLastMonthStats({ present: 0, absent: 0 });
        }
    }, [id]);

    if (!teacher) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Teacher not found</p>
                <button onClick={() => navigate('/teachers')} className="text-blue-500 mt-2">Back to Teachers</button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/teachers')}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft size={20} />
                <span>Back to Teachers</span>
            </button>

            {/* Header Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-6">
                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-3xl">
                    {teacher.fullName.charAt(0)}
                </div>
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-gray-800">{teacher.fullName}</h1>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                            Active
                        </span>
                    </div>
                    <p className="text-gray-500 flex items-center gap-2">
                        <span className="font-mono bg-gray-100 px-2 rounded text-xs text-gray-600">{teacher.id}</span>
                        • {teacher.gender}
                    </p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Contact Info</h3>

                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                            <Phone size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Phone</p>
                            <p className="text-gray-800 font-medium">{teacher.phone}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Academic Info</h3>

                    <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                            <GraduationCap size={18} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase font-medium">Assigned Grades</p>
                            <div className="flex flex-wrap gap-2 mt-1">
                                {teacher.assignedGrades.map(g => (
                                    <span key={g} className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-medium border border-purple-100">
                                        {g}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <h3 className="font-semibold text-gray-800 border-b border-gray-100 pb-2">Last Month Summary</h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded-xl border border-green-100">
                            <p className="text-xs text-green-600 uppercase font-bold">Present</p>
                            <p className="text-2xl font-bold text-green-700">{lastMonthStats.present}</p>
                            <p className="text-[10px] text-green-600 mt-1 italic">Explicitly Marked</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                            <p className="text-xs text-red-600 uppercase font-bold">Absent</p>
                            <p className="text-2xl font-bold text-red-700">{lastMonthStats.absent}</p>
                            <p className="text-[10px] text-red-600 mt-1 italic">Explicitly Marked</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 md:col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-medium">Joined On</p>
                        <p className="text-gray-800">{new Date(teacher.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
