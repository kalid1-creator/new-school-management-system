export type AttendanceStatus = 'Present' | 'Absent';

export interface AttendanceRecord {
    id: string;
    studentId: string;
    studentName: string; // Denormalized for easier display
    grade: string;       // Denormalized for easier display
    date: string;        // YYYY-MM-DD
    status: AttendanceStatus;
    timestamp: string;
}

export interface DailyAttendanceStats {
    date: string;
    present: number;
    absent: number;
    total: number;
}
