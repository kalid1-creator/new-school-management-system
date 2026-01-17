export interface Teacher {
    id: string;
    fullName: string;
    phone: string;
    gender: string;
    assignedGrades: string[];
    createdAt: string;
}

export type TeacherFormData = Omit<Teacher, 'id' | 'createdAt'>;
