import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar as CalendarIcon, Save, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { storage } from '../lib/storage';
import { useNotification } from '../context/NotificationContext';
import type { Grade } from '../types/class';
import type { Student } from '../types/student';
import type { AttendanceStatus } from '../types/attendance';

export default function Attendance() {
    const { showSuccess } = useNotification();
    const [searchParams] = useSearchParams();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [allStudents, setAllStudents] = useState<Student[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedGrade, setSelectedGrade] = useState<string>("");
    const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'All');
    const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    // Update status filtering if URL changes
    useEffect(() => {
        const statusParam = searchParams.get('status');
        setSelectedStatus(statusParam || 'All');
    }, [searchParams]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [studentList, gradeList, attendanceRecords] = await Promise.all([
                storage.getStudents(),
                storage.getGrades(),
                storage.getAttendance()
            ]);
            setAllStudents(studentList);
            setGrades(gradeList);

            const records = attendanceRecords.filter(r => r.date === selectedDate);
            const currentAttendance: Record<string, AttendanceStatus> = {};

            records.forEach(r => {
                currentAttendance[r.studentId] = r.status;
            });

            setAttendance(currentAttendance);
        } catch (err) {
            console.error('Failed to load attendance data', err);
        } finally {
            setLoading(false);
        }
    };

    // Derived state for filtered students
    const filteredStudents = allStudents.filter(student => {
        if (selectedGrade && student.grade !== selectedGrade) return false;
        const status = attendance[student.id];
        if (selectedStatus !== 'All' && status !== selectedStatus) return false;
        return true;
    });

    const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = filteredStudents
                .filter(student => attendance[student.id])
                .map(student => ({
                    student,
                    status: attendance[student.id]
                }));

            if (updates.length > 0) {
                await storage.saveAttendanceBatch(updates, selectedDate);
            }
            showSuccess('Attendance saved successfully!');
        } catch (err) {
            console.error('Failed to save attendance', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Attendance</h2>

                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        <Filter className="text-gray-400 ml-2" size={20} />
                        <select
                            value={selectedGrade}
                            onChange={(e) => setSelectedGrade(e.target.value)}
                            className="focus:outline-none text-gray-700 font-medium bg-transparent pr-2"
                        >
                            <option value="">All Grades</option>
                            {grades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
                        <Filter className="text-gray-400 ml-2" size={20} />
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="focus:outline-none text-gray-700 font-medium bg-transparent pr-2"
                        >
                            <option value="All">All Status</option>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </div>

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
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading students...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        {selectedGrade ? `No students found in ${selectedGrade}.` : "No students found."}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Student ID</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Full Name</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Grade</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredStudents.map((student) => {
                                        const status = attendance[student.id];
                                        return (
                                            <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{student.id}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.fullName}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">
                                                    <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium border border-purple-100">
                                                        {student.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex bg-gray-100 rounded-lg p-1">
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Present')}
                                                            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${status === 'Present'
                                                                ? 'bg-white text-green-700 shadow-sm ring-1 ring-gray-200'
                                                                : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                        >
                                                            <CheckCircle2 size={16} className={status === 'Present' ? 'text-green-600' : 'text-gray-400'} />
                                                            Present
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(student.id, 'Absent')}
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
