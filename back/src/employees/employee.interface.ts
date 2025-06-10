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
  assignedManagerId?: string; 
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
  assignedManagerId?: string; 
}

export interface IEmployeeFilter {
  firstName?: string;
  lastName?: string;
  email?: string;
  departmentId?: number;
  positionId?: number;
  isActive?: boolean;
  page?: number;
  limit?: number;
}