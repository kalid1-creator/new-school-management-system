export interface Payment {
    id: string;
    studentId: string;
    studentName: string;
    grade: string;
    amount: number;
    currency: 'ETB';
    month: string;
    year: string;
    paymentDate: string; // ISO date string
    timestamp: string;
}

export interface PaymentFormData {
    studentId: string;
    studentName: string;
    grade: string;
    amount: number;
    month: string;
    year: string;
}

export const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

export const YEARS = ['2023', '2024', '2025', '2026', '2027'];
