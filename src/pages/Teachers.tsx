import { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import type { Teacher } from '../types/teacher';

export default function Teachers() {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        setLoading(true);
        const data = await storage.getTeachers();
        setTeachers(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this teacher?')) {
            await storage.deleteTeacher(id);
            await loadTeachers();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Teachers</h2>
                <button
                    onClick={() => navigate('/teachers/add')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-medium">Add New Teacher</span>
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading teachers...</div>
                ) : teachers.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-purple-50 p-4 rounded-full mb-4">
                            <GraduationCap size={32} className="text-purple-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No teachers found</h3>
                        <p className="text-gray-500 mt-1">Get started by adding a new teacher.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Teacher ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Full Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Gender</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Assigned Grades</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {teachers.map((teacher) => (
                                    <tr key={teacher.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{teacher.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{teacher.fullName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{teacher.phone}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{teacher.gender}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="flex flex-wrap gap-1">
                                                {teacher.assignedGrades.map(g => (
                                                    <span key={g} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium border border-blue-100">
                                                        {g}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/teachers/view/${teacher.id}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/teachers/edit/${teacher.id}`)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(teacher.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
