export interface ICreateEmployee {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: Date;
  hireDate?: Date;
  phone?: string;
  tgID?: number;
  tgUsername?: string;
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
  tgID?: number;
  tgUsername?: string;
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

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: Date;
  hireDate?: Date;
  phone?: string;
  tgID?: number;
  tgUsername?: string;
  userId: string;
  departmentId: number;
  positionId: number;
  assignedManagerId?: string;
}