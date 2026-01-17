export interface Student {
    id: string;
    fullName: string;
    gender: string;
    dob: string;
    grade: string;
    parentName: string;
    parentPhone: string;
    createdAt: string;
}

export type StudentFormData = Omit<Student, 'id' | 'createdAt'>;
