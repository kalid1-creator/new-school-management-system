import { useState, useEffect } from 'react';
import { Plus, Trash2, Library, AlertCircle, Loader2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { useNotification } from '../context/NotificationContext';
import { db } from '../lib/db';
import type { Grade } from '../types/class';

export default function Classes() {
    const { showSuccess } = useNotification();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [newGradeName, setNewGradeName] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        setLoading(true);
        try {
            const data = await db.getGrades();
            setGrades(data);
        } catch (err) {
            console.error('Failed to fetch grades', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGrade = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newGradeName.trim()) return;

        setSaving(true);
        setError(null);
        try {
            await storage.saveGrade({ name: newGradeName.trim() });
            setNewGradeName('');
            await fetchGrades();
            showSuccess('Class added successfully!');
        } catch (err) {
            setError('Failed to add class. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteGrade = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

        const result = await storage.deleteGrade(id);
        if (result.success) {
            await fetchGrades();
        } else {
            alert(result.message || 'Failed to delete class.');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Classes Management</h2>
                    <p className="text-gray-500 text-sm">Create and manage school grades/classes</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Add Grade Form */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Plus size={20} className="text-primary" />
                            Add New Class
                        </h3>
                        <form onSubmit={handleAddGrade} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class / Grade Name
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newGradeName}
                                    onChange={(e) => setNewGradeName(e.target.value)}
                                    placeholder="e.g. Grade 1 or KG1"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                                    <AlertCircle size={16} />
                                    <span>{error}</span>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={saving || !newGradeName.trim()}
                                className="w-full bg-primary text-white py-2 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                Add Class
                            </button>
                        </form>
                    </div>
                </div>

                {/* Grades List */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                                Existing Classes
                            </h3>
                        </div>
                        {loading ? (
                            <div className="flex justify-center items-center p-12">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        ) : grades.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">
                                <Library size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>No classes created yet.</p>
                                <p className="text-sm">Use the form to create your first class.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center w-20">#</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Class / Grade Name</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {grades.map((grade, index) => (
                                            <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 text-center">{index + 1}</td>
                                                <td className="px-6 py-4">
                                                    <span className="font-medium text-gray-800">{grade.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => handleDeleteGrade(grade.id, grade.name)}
                                                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Class"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
