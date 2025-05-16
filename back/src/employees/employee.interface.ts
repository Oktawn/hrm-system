export interface ICreateEmployee {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: Date;
  hireDate?: Date;
  phone?: string;
  departmentId?: number;
  positionId?: number;
}

export interface IUpdateEmployee {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: Date;
  hireDate?: Date;
  phone?: string;
  departmentId?: number;
  positionId?: number;
}

export interface IEmployeeFilter {
  firstName?: string;
  lastName?: string;
  departmentId?: number;
  positionId?: number;
  page?: number;
  limit?: number;
}