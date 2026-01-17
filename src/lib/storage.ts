import type { Student, StudentFormData } from '../types/student';
import type { Parent } from '../types/parent';
import type { AttendanceRecord, AttendanceStatus, DailyAttendanceStats } from '../types/attendance';
import type { Teacher, TeacherFormData } from '../types/teacher';
import type { Payment, PaymentFormData } from '../types/payment';
import type { Grade, GradeFormData } from '../types/class';

import { db } from './db';

const STORAGE_KEY_STUDENTS = 'school_students';
const STORAGE_KEY_PARENTS = 'school_parents';
const STORAGE_KEY_ATTENDANCE = 'school_attendance';
const STORAGE_KEY_TEACHERS = 'school_teachers';
const STORAGE_KEY_TEACHER_ATTENDANCE = 'school_teacher_attendance';
const STORAGE_KEY_GRADES = 'school_grades';
const STORAGE_KEY_PAYMENTS = 'school_payments';

export const storage = {
    // --- CLEAR ALL DATA (Optional/Debug) ---
    clearAll: async () => {
        localStorage.clear();
        // IDB clear is handled by dev tools usually, but we could add methods to db if needed.
    },

    // --- STUDENTS ---
    getStudents: async (): Promise<Student[]> => {
        return await db.getStudents();
    },

    getStudent: async (id: string): Promise<Student | undefined> => {
        const students = await storage.getStudents();
        return students.find((s) => s.id === id);
    },

    saveStudent: async (data: StudentFormData): Promise<Student> => {
        const students = await storage.getStudents();
        const nextIdNumber = await storage.getNextStudentIdNumber();
        const newStudent: Student = {
            ...data,
            id: `ST${String(nextIdNumber).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
        };

        // Auto-link Parent
        await storage.linkParent(newStudent.id, data.parentName, data.parentPhone);

        const updatedStudents = [newStudent, ...students];
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedStudents));
        await db.syncStudents(updatedStudents);

        return newStudent;
    },

    updateStudent: async (id: string, data: StudentFormData): Promise<Student | null> => {
        const students = await storage.getStudents();
        const index = students.findIndex((s) => s.id === id);

        if (index === -1) return null;

        const oldStudent = students[index];
        if (oldStudent.parentPhone !== data.parentPhone || oldStudent.parentName !== data.parentName) {
            await storage.linkParent(id, data.parentName, data.parentPhone);
        }

        const updatedStudent = { ...students[index], ...data };
        students[index] = updatedStudent;

        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(students));
        await db.syncStudents(students);

        return updatedStudent;
    },

    deleteStudent: async (id: string): Promise<void> => {
        const students = await storage.getStudents();
        const updatedStudents = students.filter((s) => s.id !== id);
        localStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(updatedStudents));
        await db.syncStudents(updatedStudents);
    },

    getNextStudentIdNumber: async (): Promise<number> => {
        const students = await storage.getStudents();
        if (students.length === 0) return 1;
        const ids = students.map(s => parseInt(s.id.replace('ST', ''), 10)).filter(id => !isNaN(id));
        return Math.max(...ids, 0) + 1;
    },

    // --- PARENTS ---
    getParents: async (): Promise<Parent[]> => {
        return await db.getParents();
    },

    linkParent: async (studentId: string, parentName: string, parentPhone: string): Promise<void> => {
        const parents = await storage.getParents();
        const existingParentIndex = parents.findIndex(p => p.phone === parentPhone);

        if (existingParentIndex >= 0) {
            const parent = parents[existingParentIndex];
            if (!parent.studentIds.includes(studentId)) {
                parent.studentIds.push(studentId);
                parent.fullName = parentName;
                parents[existingParentIndex] = parent;
                localStorage.setItem(STORAGE_KEY_PARENTS, JSON.stringify(parents));
                await db.syncParents(parents);
            }
        } else {
            const newParent: Parent = {
                id: `P${Date.now()}`,
                fullName: parentName,
                phone: parentPhone,
                studentIds: [studentId],
                createdAt: new Date().toISOString()
            };
            parents.push(newParent);
            localStorage.setItem(STORAGE_KEY_PARENTS, JSON.stringify(parents));
            await db.syncParents(parents);
        }
    },

    // --- ATTENDANCE ---
    getAttendance: async (): Promise<AttendanceRecord[]> => {
        return await db.getAttendance();
    },

    saveAttendance: async (student: Student, date: string, status: AttendanceStatus): Promise<void> => {
        return storage.saveAttendanceBatch([{ student, status }], date);
    },

    saveAttendanceBatch: async (updates: { student: Student; status: AttendanceStatus }[], date: string): Promise<void> => {
        const records = await storage.getAttendance();
        const timestamp = new Date().toISOString();

        updates.forEach(({ student, status }) => {
            const existingIndex = records.findIndex(r => r.studentId === student.id && r.date === date);
            const record: AttendanceRecord = {
                id: existingIndex >= 0 ? records[existingIndex].id : `${student.id}-${date}`,
                studentId: student.id,
                studentName: student.fullName,
                grade: student.grade,
                date,
                status,
                timestamp
            };

            if (existingIndex >= 0) {
                records[existingIndex] = record;
            } else {
                records.push(record);
            }
        });

        localStorage.setItem(STORAGE_KEY_ATTENDANCE, JSON.stringify(records));
        await db.syncAttendance(records);
    },
    getDailyStats: async (date: string): Promise<DailyAttendanceStats> => {
        const allRecords = await storage.getAttendance();
        const records = allRecords.filter(r => r.date === date);
        const students = await storage.getStudents();

        const absentCount = records.filter(r => r.status === 'Absent').length;
        const presentCount = records.filter(r => r.status === 'Present').length;

        return {
            date,
            present: presentCount,
            absent: absentCount,
            total: students.length
        };
    },

    getWeeklyStats: async (): Promise<{ name: string, present: number, absent: number }[]> => {
        const stats = [];
        const today = new Date();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

        for (let i = 4; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            const daily = await storage.getDailyStats(dateStr);
            stats.push({
                name: days[d.getDay()],
                present: daily.present,
                absent: daily.absent
            });
        }
        return stats;
    },

    // --- TEACHERS ---
    getTeachers: async (): Promise<Teacher[]> => {
        return await db.getTeachers();
    },

    saveTeacher: async (data: TeacherFormData): Promise<Teacher> => {
        const teachers = await storage.getTeachers();
        const nextIdNumber = await storage.getNextTeacherIdNumber();
        const newTeacher: Teacher = {
            ...data,
            id: `T${String(nextIdNumber).padStart(3, '0')}`,
            createdAt: new Date().toISOString(),
        };

        const updatedTeachers = [newTeacher, ...teachers];
        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(updatedTeachers));
        await db.syncTeachers(updatedTeachers);
        return newTeacher;
    },

    updateTeacher: async (id: string, data: TeacherFormData): Promise<Teacher | null> => {
        const teachers = await storage.getTeachers();
        const index = teachers.findIndex(t => t.id === id);

        if (index === -1) return null;

        const updatedTeacher = { ...teachers[index], ...data };
        teachers[index] = updatedTeacher;

        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(teachers));
        await db.syncTeachers(teachers);
        return updatedTeacher;
    },

    deleteTeacher: async (id: string): Promise<void> => {
        const teachers = await storage.getTeachers();
        const updatedTeachers = teachers.filter(t => t.id !== id);
        localStorage.setItem(STORAGE_KEY_TEACHERS, JSON.stringify(updatedTeachers));
        await db.syncTeachers(updatedTeachers);
    },

    getNextTeacherIdNumber: async (): Promise<number> => {
        const teachers = await storage.getTeachers();
        if (teachers.length === 0) return 1;
        const ids = teachers.map(t => parseInt(t.id.replace('T', ''), 10)).filter(id => !isNaN(id));
        return Math.max(...ids, 0) + 1;
    },

    // --- TEACHER ATTENDANCE ---
    getTeacherAttendance: async (): Promise<AttendanceRecord[]> => {
        return await db.getTeacherAttendance();
    },

    saveTeacherAttendance: async (teacher: Teacher, date: string, status: AttendanceStatus): Promise<void> => {
        return storage.saveTeacherAttendanceBatch([{ teacher, status }], date);
    },

    saveTeacherAttendanceBatch: async (updates: { teacher: Teacher; status: AttendanceStatus }[], date: string): Promise<void> => {
        const records = await storage.getTeacherAttendance();
        const timestamp = new Date().toISOString();

        updates.forEach(({ teacher, status }) => {
            const existingIndex = records.findIndex(r => r.studentId === teacher.id && r.date === date);

            const record: AttendanceRecord = {
                id: existingIndex >= 0 ? records[existingIndex].id : `T-${teacher.id}-${date}`,
                studentId: teacher.id,
                studentName: teacher.fullName,
                grade: 'N/A',
                date,
                status,
                timestamp
            };

            if (existingIndex >= 0) {
                records[existingIndex] = record;
            } else {
                records.push(record);
            }
        });

        localStorage.setItem(STORAGE_KEY_TEACHER_ATTENDANCE, JSON.stringify(records));
        await db.syncTeacherAttendance(records);
    },

    // --- PAYMENTS ---
    getPayments: async (): Promise<Payment[]> => {
        return await db.getPayments();
    },

    savePayment: async (data: PaymentFormData): Promise<{ success: boolean; message?: string; payment?: Payment }> => {
        const payments = await storage.getPayments();

        const exists = payments.some(p =>
            p.studentId === data.studentId &&
            p.month === data.month &&
            p.year === data.year
        );

        if (exists) {
            return { success: false, message: 'Payment already exists for this student in the selected month and year.' };
        }

        const newPayment: Payment = {
            ...data,
            id: `PAY-${Date.now()}`,
            currency: 'ETB',
            paymentDate: new Date().toISOString().split('T')[0],
            timestamp: new Date().toISOString()
        };

        const updatedPayments = [newPayment, ...payments];
        localStorage.setItem(STORAGE_KEY_PAYMENTS, JSON.stringify(updatedPayments));
        await db.syncPayments(updatedPayments);

        return { success: true, payment: newPayment };
    },

    getTotalRevenue: async (): Promise<number> => {
        const payments = await storage.getPayments();
        return payments.reduce((sum, p) => sum + p.amount, 0);
    },

    getMonthlyRevenueStats: async (): Promise<{ name: string, revenue: number }[]> => {
        const payments = await storage.getPayments();
        const stats: Record<string, number> = {};
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        months.forEach(m => stats[m] = 0);

        payments.forEach(p => {
            const date = new Date(p.paymentDate);
            if (!isNaN(date.getTime())) {
                const monthName = months[date.getMonth()];
                stats[monthName] += p.amount;
            }
        });

        return months.map(m => ({ name: m, revenue: stats[m] }));
    },

    // --- GRADES ---
    getGrades: async (): Promise<Grade[]> => {
        return await db.getGrades();
    },

    saveGrade: async (data: GradeFormData): Promise<Grade> => {
        const grades = await storage.getGrades();
        const newGrade: Grade = {
            id: `G-${Date.now()}`,
            name: data.name,
            createdAt: new Date().toISOString(),
        };

        const updatedGrades = [...grades, newGrade];
        localStorage.setItem(STORAGE_KEY_GRADES, JSON.stringify(updatedGrades));
        await db.syncGrades(updatedGrades);

        return newGrade;
    },

    deleteGrade: async (id: string): Promise<{ success: boolean, message?: string }> => {
        const students = await storage.getStudents();
        const grades = await storage.getGrades();
        const gradeToDelete = grades.find(g => g.id === id);

        if (!gradeToDelete) return { success: false, message: 'Grade not found.' };

        const isUsed = students.some(s => s.grade === gradeToDelete.name);
        if (isUsed) {
            return { success: false, message: 'Cannot delete grade as it is assigned to students.' };
        }

        const updatedGrades = grades.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEY_GRADES, JSON.stringify(updatedGrades));
        await db.syncGrades(updatedGrades);

        return { success: true };
    }
};
