export interface Grade {
    id: string;
    courseId: string;
    professorId: string;
    studentId: string;
    grade: number;
    comments?: string;
}

export type CreateGradeRequest = Omit<Grade, 'id'>;

// Tipo para actualizar una calificación
export type UpdateGradeRequest = Partial<Omit<Grade, 'id'>> & { id: string };

// Lista de calificaciones
export type GradeListResponse = Grade[];