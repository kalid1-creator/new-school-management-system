import { useEffect, useState } from 'react';
import { Calendar as CalendarIcon, Save, CheckCircle2, XCircle } from 'lucide-react';
import { storage } from '../lib/storage';
import { useNotification } from '../context/NotificationContext';
import type { Teacher } from '../types/teacher';
import type { AttendanceStatus } from '../types/attendance';

export default function TeacherAttendance() {
    const { showSuccess } = useNotification();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        setLoading(true);
        try {
            const list = await storage.getTeachers();
            setTeachers(list);

            const allTeacherRecords = await storage.getTeacherAttendance();
            const records = allTeacherRecords.filter(r => r.date === selectedDate);
            const currentAttendance: Record<string, AttendanceStatus> = {};

            records.forEach(r => {
                currentAttendance[r.studentId] = r.status;
            });

            setAttendance(currentAttendance);
        } catch (error) {
            console.error('Failed to load teacher attendance', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (teacherId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [teacherId]: status
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = teachers
                .filter(teacher => attendance[teacher.id])
                .map(teacher => ({
                    teacher,
                    status: attendance[teacher.id]
                }));

            if (updates.length > 0) {
                await storage.saveTeacherAttendanceBatch(updates, selectedDate);
            }
            showSuccess('Teacher attendance saved successfully!');
        } catch (error) {
            console.error('Failed to save teacher attendance', error);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Teacher Attendance</h2>

                <div className="flex items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                    <CalendarIcon className="text-gray-400 ml-2" size={20} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="focus:outline-none text-gray-700 font-medium bg-transparent"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading teachers...</div>
                ) : teachers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No teachers found. Add teachers first.
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Teacher ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Full Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {teachers.map((teacher) => {
                                        const status = attendance[teacher.id];
                                        return (
                                            <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{teacher.id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{teacher.fullName}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                                        <button
                                                            onClick={() => handleStatusChange(teacher.id, 'Present')}
                                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'Present'
                                                                ? 'bg-white text-green-700 shadow-sm ring-1 ring-gray-200'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                        >
                                                            <CheckCircle2 size={16} className={status === 'Present' ? 'text-green-600' : 'text-gray-400'} />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(teacher.id, 'Absent')}
                                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'Absent'
                                                                ? 'bg-white text-red-700 shadow-sm ring-1 ring-gray-200'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                        >
                                                            <XCircle size={16} className={status === 'Absent' ? 'text-red-600' : 'text-gray-400'} />
                                                            Absent
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-md shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <Save size={20} />
                                {saving ? 'Saving...' : 'Save Attendance'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
