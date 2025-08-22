export interface Department {

    id: string;
    name: string;
    description: string;

}

//Tipo adicional para creación de departamento

export type CreateDepartmentRequest = Omit<Department, 'id'>;

//Tipo adicional para actualización de departamento

export type UpdateDepartmentRequest = Partial<Omit<Department, 'id'>> & {id: string};

//Lista de departamento

export type DepartmentListResponse = Department[];