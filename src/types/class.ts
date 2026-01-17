export interface Grade {
    id: string;
    name: string;
    createdAt: string;
}

export type GradeFormData = Omit<Grade, 'id' | 'createdAt'>;
