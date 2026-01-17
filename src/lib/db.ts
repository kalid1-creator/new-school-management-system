import localforage from 'localforage';
import type { Student } from '../types/student';
import type { Payment } from '../types/payment';
import type { Grade } from '../types/class';

// Configure instances
const studentsStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'students'
});

const parentsStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'parents'
});

const attendanceStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'attendance'
});

const teachersStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'teachers'
});

const teacherAttendanceStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'teacher_attendance'
});

const paymentsStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'payments'
});

const gradesStore = localforage.createInstance({
    name: 'SchoolApp',
    storeName: 'grades'
});

export const db = {
    // --- Students ---
    getStudents: async (): Promise<Student[]> => {
        try {
            const data = await studentsStore.getItem<Student[]>('all_students');
            if (data) return data;
            const raw = localStorage.getItem('school_students');
            if (raw) {
                const parsed = JSON.parse(raw);
                await studentsStore.setItem('all_students', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncStudents: async (students: Student[]) => {
        try {
            await studentsStore.setItem('all_students', students);
        } catch (e) {
            console.error('Failed to sync students to IDB', e);
        }
    },

    // --- Parents ---
    getParents: async (): Promise<any[]> => {
        try {
            const data = await parentsStore.getItem<any[]>('all_parents');
            if (data) return data;
            const raw = localStorage.getItem('school_parents');
            if (raw) {
                const parsed = JSON.parse(raw);
                await parentsStore.setItem('all_parents', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncParents: async (parents: any[]) => {
        try {
            await parentsStore.setItem('all_parents', parents);
        } catch (e) {
            console.error('Failed to sync parents to IDB', e);
        }
    },

    // --- Attendance ---
    getAttendance: async (): Promise<any[]> => {
        try {
            const data = await attendanceStore.getItem<any[]>('all_attendance');
            if (data) return data;
            const raw = localStorage.getItem('school_attendance');
            if (raw) {
                const parsed = JSON.parse(raw);
                await attendanceStore.setItem('all_attendance', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncAttendance: async (records: any[]) => {
        try {
            await attendanceStore.setItem('all_attendance', records);
        } catch (e) {
            console.error('Failed to sync attendance to IDB', e);
        }
    },

    // --- Teachers ---
    getTeachers: async (): Promise<any[]> => {
        try {
            const data = await teachersStore.getItem<any[]>('all_teachers');
            if (data) return data;
            const raw = localStorage.getItem('school_teachers');
            if (raw) {
                const parsed = JSON.parse(raw);
                await teachersStore.setItem('all_teachers', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncTeachers: async (teachers: any[]) => {
        try {
            await teachersStore.setItem('all_teachers', teachers);
        } catch (e) {
            console.error('Failed to sync teachers to IDB', e);
        }
    },

    // --- Teacher Attendance ---
    getTeacherAttendance: async (): Promise<any[]> => {
        try {
            const data = await teacherAttendanceStore.getItem<any[]>('all_teacher_attendance');
            if (data) return data;
            const raw = localStorage.getItem('school_teacher_attendance');
            if (raw) {
                const parsed = JSON.parse(raw);
                await teacherAttendanceStore.setItem('all_teacher_attendance', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncTeacherAttendance: async (records: any[]) => {
        try {
            await teacherAttendanceStore.setItem('all_teacher_attendance', records);
        } catch (e) {
            console.error('Failed to sync teacher attendance to IDB', e);
        }
    },

    // --- Payments ---
    getPayments: async (): Promise<Payment[]> => {
        try {
            const data = await paymentsStore.getItem<Payment[]>('all_payments');
            if (data) return data;
            const raw = localStorage.getItem('school_payments');
            if (raw) {
                const parsed = JSON.parse(raw);
                await paymentsStore.setItem('all_payments', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncPayments: async (payments: Payment[]) => {
        try {
            await paymentsStore.setItem('all_payments', payments);
        } catch (e) {
            console.error('Failed to sync payments to IDB', e);
        }
    },

    // --- Grades ---
    getGrades: async (): Promise<Grade[]> => {
        try {
            const data = await gradesStore.getItem<Grade[]>('all_grades');
            if (data) return data;
            const raw = localStorage.getItem('school_grades');
            if (raw) {
                const parsed = JSON.parse(raw);
                await gradesStore.setItem('all_grades', parsed);
                return parsed;
            }
            return [];
        } catch (err) {
            console.error('DB Error', err);
            return [];
        }
    },

    syncGrades: async (grades: Grade[]) => {
        try {
            await gradesStore.setItem('all_grades', grades);
        } catch (e) {
            console.error('Failed to sync grades to IDB', e);
        }
    }
};
