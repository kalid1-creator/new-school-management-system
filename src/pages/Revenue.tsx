import { useState, useEffect, useMemo } from 'react';
import { Banknote, Filter, Search, CheckCircle2, X, Loader2 } from 'lucide-react';
import { storage } from '../lib/storage';
import { useNotification } from '../context/NotificationContext';
import { MONTHS, YEARS } from '../types/payment';
import type { Payment, PaymentFormData } from '../types/payment';
import type { Student } from '../types/student';
import type { Grade } from '../types/class';

export default function Revenue() {
    const { showSuccess } = useNotification();
    const [activeTab, setActiveTab] = useState<'payments' | 'history'>('payments');
    const [students, setStudents] = useState<Student[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [selectedGrade, setSelectedGrade] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');

    // Payment Form State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [amount, setAmount] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function fetchData() {
            setLoadingData(true);
            try {
                // Fetching from Async DB/Storage
                const [s, p, g] = await Promise.all([
                    storage.getStudents(),
                    storage.getPayments(),
                    storage.getGrades()
                ]);

                if (mounted) {
                    setStudents(s);
                    setPayments(p);
                    setGrades(g);
                }
            } catch (err) {
                console.error("Failed to load revenue data", err);
            } finally {
                if (mounted) setLoadingData(false);
            }
        }

        fetchData();

        return () => { mounted = false; };
    }, []);

    // Optimized Filtering with useMemo
    const filteredStudents = useMemo(() => {
        let result = students;
        if (selectedGrade) {
            result = result.filter(s => s.grade === selectedGrade);
        }
        if (searchTerm) {
            const lowerTerm = searchTerm.toLowerCase();
            result = result.filter(s =>
                s.fullName.toLowerCase().includes(lowerTerm) ||
                s.id.toLowerCase().includes(lowerTerm)
            );
        }
        return result;
    }, [students, selectedGrade, searchTerm]);

    const handleOpenPayment = (student: Student) => {
        setSelectedStudent(student);
        setAmount('');
        setShowPaymentModal(true);
    };

    const handleClosePayment = () => {
        setShowPaymentModal(false);
        setSelectedStudent(null);
        setAmount('');
    };

    const handleSubmitPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = Number(amount);
        if (!selectedStudent || !numAmount || numAmount <= 0) return;

        setSaving(true);
        // Small delay to allow UI to render 'Saving...' state
        await new Promise(resolve => setTimeout(resolve, 50));

        try {
            const paymentData: PaymentFormData = {
                studentId: selectedStudent.id,
                studentName: selectedStudent.fullName,
                grade: selectedStudent.grade,
                amount: numAmount,
                month: selectedMonth,
                year: selectedYear
            };

            const result = await storage.savePayment(paymentData);

            if (result.success) {
                // Fetch latest payments
                const newPayments = await storage.getPayments();
                setPayments(newPayments);

                setPayments(newPayments);

                showSuccess('Payment recorded successfully!');
                handleClosePayment();
            } else {
                alert(result.message || 'Failed to record payment');
            }
        } catch (error) {
            console.error(error);
            alert('An unexpected error occurred');
        } finally {
            setSaving(false);
        }
    };

    const totalRevenue = useMemo(() => {
        return payments.reduce((sum, p) => sum + p.amount, 0);
    }, [payments]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Revenue & Payments</h2>
                    <p className="text-gray-500 text-sm">Manage student fees and view payment history</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-xl font-bold flex items-center gap-2">
                        <Banknote size={20} />
                        <span>Total: {loadingData ? '...' : totalRevenue.toLocaleString()} ETB</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('payments')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'payments'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Record Payment
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeTab === 'history'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Payment History
                </button>
            </div>

            {loadingData ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="animate-spin text-primary" size={48} />
                </div>
            ) : (
                <>
                    {activeTab === 'payments' ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4">
                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100 flex-1">
                                    <Search className="text-gray-400 ml-2" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or ID..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="bg-transparent focus:outline-none text-gray-700 placeholder-gray-400 w-full"
                                    />
                                </div>

                                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                    <Filter className="text-gray-400 ml-2" size={20} />
                                    <select
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                        className="bg-transparent focus:outline-none text-gray-700 font-medium pr-2"
                                    >
                                        <option value="">All Grades</option>
                                        {grades.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Student ID</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Full Name</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Grade</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredStudents.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-gray-500">
                                                    No students found. Try adjusting filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredStudents.map((student) => (
                                                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{student.id}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{student.fullName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium border border-purple-100">
                                                            {student.grade}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => handleOpenPayment(student)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors border border-green-200"
                                                        >
                                                            <Banknote size={16} />
                                                            Pay
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100">
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Date</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Student</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Grade</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Period</th>
                                            <th className="px-6 py-4 font-semibold text-gray-600 text-sm text-right">Amount (ETB)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {payments.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="p-8 text-center text-gray-500">
                                                    No payment records found.
                                                </td>
                                            </tr>
                                        ) : (
                                            payments.map((payment) => (
                                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.paymentDate}</td>
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-800">{payment.studentName}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.grade}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-600">{payment.month} {payment.year}</td>
                                                    <td className="px-6 py-4 text-sm font-bold text-gray-800 text-right">
                                                        {payment.amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-800">Record Payment</h3>
                            <button onClick={handleClosePayment} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPayment} className="p-6 space-y-4">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Student ID:</span>
                                    <span className="font-medium text-gray-800">{selectedStudent.id}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Name:</span>
                                    <span className="font-medium text-gray-800">{selectedStudent.fullName}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Grade:</span>
                                    <span className="font-medium text-gray-800">{selectedStudent.grade}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                                    <select
                                        value={selectedMonth}
                                        onChange={(e) => setSelectedMonth(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                    >
                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                    <select
                                        value={selectedYear}
                                        onChange={(e) => setSelectedYear(e.target.value)}
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                                    >
                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (ETB)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        required
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full px-4 py-2 pl-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="0.00"
                                    />
                                    <span className="absolute right-4 top-2 text-gray-400 text-sm font-medium">ETB</span>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleClosePayment}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving || !amount}
                                    className="flex-1 px-4 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? 'Saving...' : (
                                        <>
                                            <CheckCircle2 size={18} />
                                            Confirm Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
