export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  tgID?: number;
  tgUsername?: string;
  position?: {
    id: string;
    name: string;
  };
  department?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    email: string;
    role: string;
    isActive: boolean;
  };
  assignedManager?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    role?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeData {
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  tgID?: number;
  tgUsername?: string;
  departmentId?: number;
  positionId?: number;
  assignedManagerId?: string;
}

export interface UpdateEmployeeData {
  userId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  birthDate?: string;
  hireDate?: string;
  phone?: string;
  departmentId?: number;
  tgID?: number;
  tgUsername?: string;
  positionId?: number;
  assignedManagerId?: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  role?: string;
  department?: string;
  position?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
}

export interface EmployeesResponse {
  data: Employee[];
  total: number;
  page: number;
  limit: number;
}