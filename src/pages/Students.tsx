import { useEffect, useState } from 'react';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storage } from '../lib/storage';
import type { Student } from '../types/student';

export default function Students() {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        setLoading(true);
        const data = await storage.getStudents();
        setStudents(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await storage.deleteStudent(id);
            await loadStudents();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Students</h2>
                <button
                    onClick={() => navigate('/students/add')}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg shadow-sm hover:bg-primary/90 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    <span className="font-medium">Add New Student</span>
                </button>
            </div>

            {/* Search Bar / Filter - Placeholder for future */}
            {/* <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
          <div className="flex-1 relative">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
             <input type="text" placeholder="Search students..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" />
          </div>
      </div> */}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading students...</div>
                ) : students.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-4">
                            <Plus size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No students found</h3>
                        <p className="text-gray-500 mt-1">Get started by adding a new student.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Student ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Full Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Gender</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Grade</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Parent Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Parent Phone</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-700">{student.id}</td>
                                        <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.fullName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{student.gender}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium border border-purple-100">
                                                {student.grade}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{student.parentName}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">{student.parentPhone}</td>
                                        <td className="px-6 py-4 text-sm text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/students/view/${student.id}`)}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/students/edit/${student.id}`)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
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
