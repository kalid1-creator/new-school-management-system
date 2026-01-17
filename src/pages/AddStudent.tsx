import { useState, useEffect } from 'react';
import type { FormEvent as ReactFormEvent, ChangeEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, User, Calendar, CheckCircle2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { useNotification } from '../context/NotificationContext';
import type { StudentFormData } from '../types/student';

import { db } from '../lib/db';
import type { Grade } from '../types/class';

// Auto-generated ID simulation
const GENERATED_ID = "ST00" + Math.floor(Math.random() * 899 + 100);

export default function AddStudent() {
    const { showSuccess } = useNotification();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = Boolean(id);

    const [grades, setGrades] = useState<Grade[]>([]);
    const [gradesLoading, setGradesLoading] = useState(true);
    const [displayId, setDisplayId] = useState(GENERATED_ID);
    const [formData, setFormData] = useState<StudentFormData>({
        fullName: '',
        gender: '',
        dob: '',
        grade: '',
        parentName: '',
        parentPhone: ''
    });

    useEffect(() => {
        const loadGrades = async () => {
            setGradesLoading(true);
            try {
                const data = await db.getGrades();
                setGrades(data);
            } catch (err) {
                console.error('Failed to load grades', err);
            } finally {
                setGradesLoading(false);
            }
        };
        loadGrades();

        const loadInitialData = async () => {
            if (isEditMode && id) {
                const student = await storage.getStudent(id);
                if (student) {
                    setFormData({
                        fullName: student.fullName,
                        gender: student.gender,
                        dob: student.dob,
                        grade: student.grade,
                        parentName: student.parentName,
                        parentPhone: student.parentPhone
                    });
                    setDisplayId(student.id);
                } else {
                    alert("Student not found!");
                    navigate('/students');
                }
            } else {
                // Get next ID for display
                const nextIdNum = await storage.getNextStudentIdNumber();
                setDisplayId(`ST${String(nextIdNum).padStart(3, '0')}`);
            }
        };
        loadInitialData();
    }, [id, isEditMode, navigate]);

    const handleSubmit = async (e: ReactFormEvent) => {
        e.preventDefault();

        try {
            if (isEditMode && id) {
                await storage.updateStudent(id, formData);
            } else {
                await storage.saveStudent(formData);
            }
            showSuccess(isEditMode ? 'Student updated successfully!' : 'Student saved successfully!');
            navigate('/students');
        } catch (error) {
            console.error('Failed to save student', error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/students')} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? 'Edit Student' : 'Add New Student'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">

                {/* ID Section */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm text-purple-600 font-medium">Student ID {isEditMode ? '' : '(Auto-generated)'}</p>
                        <p className="text-xl font-bold text-purple-900 mt-1">{displayId}</p>
                    </div>
                    <CheckCircle2 className="text-purple-500" size={24} />
                </div>

                {/* Student Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-gray-400" />
                        Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                required
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="e.g. Kalid Mohamed Hassen"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Gender</label>
                            <select
                                required
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white"
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                            <div className="relative">
                                <input
                                    required
                                    type="date"
                                    name="dob"
                                    value={formData.dob}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all appearance-none"
                                />
                                <Calendar className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" size={20} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Grade</label>
                            <select
                                required
                                name="grade"
                                value={formData.grade}
                                onChange={handleChange}
                                disabled={grades.length === 0 && !gradesLoading}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                            >
                                <option value="">{gradesLoading ? 'Loading grades...' : grades.length === 0 ? 'First create a class / grade' : 'Select Grade'}</option>
                                {grades.map(grade => (
                                    <option key={grade.id} value={grade.name}>{grade.name}</option>
                                ))}
                            </select>
                            {grades.length === 0 && !gradesLoading && (
                                <p className="text-red-500 text-xs mt-1 font-medium">Please create at least one class in the Classes module first.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-100 my-8"></div>

                {/* Parent Info */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <User size={20} className="text-gray-400" />
                        Parent Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Parent Name</label>
                            <input
                                required
                                type="text"
                                name="parentName"
                                value={formData.parentName}
                                onChange={handleChange}
                                placeholder="Parent full name"
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">Parent Phone Number</label>
                            <input
                                required
                                type="tel"
                                name="parentPhone"
                                value={formData.parentPhone}
                                onChange={handleChange}
                                placeholder="+251 ..."
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={grades.length === 0}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all active:scale-95 shadow-sm shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={20} />
                        {isEditMode ? 'Update Student' : 'Save Student'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/students')}
                        className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors hover:border-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
