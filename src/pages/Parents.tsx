import { useEffect, useState } from 'react';
import { Users, Phone } from 'lucide-react';
import { storage } from '../lib/storage';
import type { Parent } from '../types/parent';

export default function Parents() {
    const [parents, setParents] = useState<Parent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadParents();
    }, []);

    const loadParents = async () => {
        setLoading(true);
        try {
            const data = await storage.getParents();
            setParents(data);
        } catch (err) {
            console.error('Failed to load parents', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Parents</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading parents...</div>
                ) : parents.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="bg-blue-50 p-4 rounded-full mb-4">
                            <Users size={32} className="text-blue-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-800">No parents found</h3>
                        <p className="text-gray-500 mt-1">Parents are added automatically when you add students.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Parent Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Phone Number</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-center">Linked Students</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Joined</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {parents.map((parent) => (
                                    <tr key={parent.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-medium text-gray-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {parent.fullName.charAt(0)}
                                            </div>
                                            {parent.fullName}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                            <div className="flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                {parent.phone}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                {parent.studentIds.length} Students
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {new Date(parent.createdAt).toLocaleDateString()}
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
