export interface Parent {
    id: string;
    fullName: string;
    phone: string;
    studentIds: string[]; // List of student IDs linked to this parent
    createdAt: string;
}
