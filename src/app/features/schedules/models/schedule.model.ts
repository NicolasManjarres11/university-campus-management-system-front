export interface Schedule {

    id: string;
    courseId: string;
    professorId: string;
    schedule : string;

}





// Tipo para crear un nuevo horario
export type CreateScheduleRequest = Omit<Schedule, 'id'>;

// Tipo para actualizar un horario
export type UpdateScheduleRequest = Partial<Omit<Schedule, 'id'>> & { id: string };

// Lista de horarios
export type ScheduleListResponse = Schedule[];