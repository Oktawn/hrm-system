import { employeeRepository, userRepository, departmentRepository, positionRepository } from "../db/db-rep";
import { ICreateEmployee, IEmployeeFilter, IUpdateEmployee } from "./employee.interface";
import createError from "http-errors";
import { UserRoleEnum } from "../commons/enums/enums";



export class EmployeesService {
  async getAllEmployees(filter: IEmployeeFilter) {
    filter.page = filter.page || 1;
    filter.limit = filter.limit || 100; 

    const queryB = employeeRepository.createQueryBuilder("employee");
    queryB.leftJoinAndSelect("employee.department", "department");
    queryB.leftJoinAndSelect("employee.position", "position");
    queryB.leftJoinAndSelect("employee.user", "user");
    queryB.leftJoinAndSelect("employee.assignedManager", "assignedManager");
    queryB.leftJoinAndSelect("assignedManager.user", "assignedManagerUser");
    
    if (filter.firstName) {
      queryB.andWhere("employee.firstName ILIKE :firstName", {
        firstName: `%${filter.firstName}%`,
      });
    }
    if (filter.lastName) {
      queryB.andWhere("employee.lastName ILIKE :lastName", {
        lastName: `%${filter.lastName}%`,
      });
    }

    if (filter.email) {
      queryB.andWhere("user.email ILIKE :email", {
        email: `%${filter.email}%`,
      });
    }

    if (filter.departmentId) {
      queryB.andWhere("employee.departmentId = :departmentId", { departmentId: filter.departmentId });
    }

    if (filter.positionId) {
      queryB.andWhere("employee.positionId = :positionId", { positionId: filter.positionId });
    }

    if (filter.isActive !== undefined) {
      queryB.andWhere("user.isActive = :isActive", { isActive: filter.isActive });
    }

    queryB.orderBy("employee.lastName", "ASC")
         .addOrderBy("employee.firstName", "ASC");

    const page = (filter.page - 1) * filter.limit;
    queryB.skip(page).take(filter.limit);
    const [employees, total] = await queryB.getManyAndCount();
    
    const modifiedEmployees = employees.map(employee => ({
      ...employee,
      user: employee.user ? { 
        id: employee.user.id,
        email: employee.user.email,
        role: employee.user.role,
        isActive: employee.user.isActive
      } : null
    }));
    
    return {
      data: modifiedEmployees,
      meta: {
        page: filter.page,
        limit: filter.limit,
        total: total,
        totalPages: Math.ceil(total / filter.limit),
      }
    }
  }

  async getEmployeeById(id: string) {
    const employee = await employeeRepository.findOne({
      where: { user: { id: id } },
      relations: ["department", "position", "user", "assignedManager", "assignedManager.user"],
    });
    if (!employee) {
      throw createError(404, "Employee not found");
    }
    const user = employee.user ? {
      id: employee.user.id,
      email: employee.user.email,
      role: employee.user.role,
      isActive: employee.user.isActive
    } : null;

    const assignedManager = employee.assignedManager ? {
      id: employee.assignedManager.id,
      firstName: employee.assignedManager.firstName,
      lastName: employee.assignedManager.lastName,
      email: employee.assignedManager.user?.email,
      role: employee.assignedManager.user?.role
    } : null;

    return {
      ...employee,
      user: user,
      assignedManager: assignedManager
    };
  }

  async createEmployee(employeeData: ICreateEmployee) {
    const { email, departmentId, positionId, assignedManagerId, ...data } = employeeData;
    
    const findUser = await userRepository.findOne({
      where: { email: email },
    });
    
    if (!findUser) {
      throw createError(404, "User not found. Create user account first.");
    }
    
    const existingEmployee = await employeeRepository.findOne({
      where: { user: { id: findUser.id } },
    });
    
    if (existingEmployee) {
      throw createError(400, "This user is already associated with an employee");
    }

    let department = null;
    if (departmentId) {
      department = await departmentRepository.findOne({
        where: { id: departmentId }
      });
      if (!department) {
        throw createError(404, "Department not found");
      }
    }

    let position = null;
    if (positionId) {
      position = await positionRepository.findOne({
        where: { id: positionId }
      });
      if (!position) {
        throw createError(404, "Position not found");
      }
    }

    let assignedManager = null;
    if (assignedManagerId) {
      assignedManager = await employeeRepository.findOne({
        where: { id: assignedManagerId },
        relations: ["user"]
      });
      if (!assignedManager) {
        throw createError(404, "Assigned manager not found");
      }
      
      if (![UserRoleEnum.HR, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(assignedManager.user.role)) {
        throw createError(400, "Assigned manager must have HR, Manager, or Admin role");
      }
    }

    const newEmployee = employeeRepository.create({
      ...data,
      user: findUser,
      department,
      position,
      assignedManager
    });

    try {
      await employeeRepository.save(newEmployee);
      return await this.getEmployeeById(findUser.id);
    } catch (error) {
      throw createError(500, "Error creating employee");
    }
  }

  async updateEmployee(employeeData: IUpdateEmployee) {
    const { userId, email, departmentId, positionId, assignedManagerId, ...data } = employeeData;
    
    const findEmployee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user", "department", "position", "assignedManager"],
    });
    
    if (!findEmployee) {
      throw createError(404, "Employee not found");
    }

    try {
      if (email) {
        const findUser = await userRepository.findOne({
          where: { id: userId }
        });
        if (findUser) {
          findUser.email = email;
          await userRepository.save(findUser);
        }
      }

      if (departmentId !== undefined) {
        if (departmentId === null) {
          findEmployee.department = null;
        } else {
          const department = await departmentRepository.findOne({
            where: { id: departmentId }
          });
          if (!department) {
            throw createError(404, "Department not found");
          }
          findEmployee.department = department;
        }
      }

      if (positionId !== undefined) {
        if (positionId === null) {
          findEmployee.position = null;
        } else {
          const position = await positionRepository.findOne({
            where: { id: positionId }
          });
          if (!position) {
            throw createError(404, "Position not found");
          }
          findEmployee.position = position;
        }
      }

      if (assignedManagerId !== undefined) {
        if (assignedManagerId === null) {
          findEmployee.assignedManager = null;
        } else {
          const assignedManager = await employeeRepository.findOne({
            where: { id: assignedManagerId },
            relations: ["user"]
          });
          if (!assignedManager) {
            throw createError(404, "Assigned manager not found");
          }
          
          if (![UserRoleEnum.HR, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN].includes(assignedManager.user.role)) {
            throw createError(400, "Assigned manager must have HR, Manager, or Admin role");
          }
          
          findEmployee.assignedManager = assignedManager;
        }
      }

      for (const key in data) {
        if (data[key] !== undefined) {
          findEmployee[key] = data[key];
        }
      }

      await employeeRepository.save(findEmployee);
      return await this.getEmployeeById(userId);

    } catch (error) {
      if (error.status) {
        throw error;
      }
      throw createError(500, "Error updating employee");
    }
  }

  async deleteEmployee(id: string) {
    const employee = await employeeRepository.findOne({
      where: { id },
    });
    if (!employee) {
      throw createError(404, "Employee not found");
    }
    try {
      await employeeRepository.remove(employee);
    } catch (error) {
      throw createError(500, "Error deleting employee");
    }
  }

  async getAvailableManagers() {
    try {
      const managers = await employeeRepository
        .createQueryBuilder("employee")
        .leftJoinAndSelect("employee.user", "user")
        .leftJoinAndSelect("employee.department", "department")
        .leftJoinAndSelect("employee.position", "position")
        .where("user.role IN (:...roles)", { 
          roles: [UserRoleEnum.HR, UserRoleEnum.MANAGER, UserRoleEnum.ADMIN] 
        })
        .andWhere("user.isActive = :isActive", { isActive: true })
        .orderBy("employee.lastName", "ASC")
        .addOrderBy("employee.firstName", "ASC")
        .getMany();

      return managers.map(manager => ({
        id: manager.id,
        firstName: manager.firstName,
        lastName: manager.lastName,
        middleName: manager.middleName,
        email: manager.user?.email,
        role: manager.user?.role,
        department: manager.department?.name,
        position: manager.position?.name
      }));
    } catch (error) {
      throw createError(500, "Error fetching available managers");
    }
  }

  async getEmployeeStats() {
    try {
      const totalEmployees = await employeeRepository.count();
      
      const activeEmployees = await employeeRepository
        .createQueryBuilder("employee")
        .leftJoin("employee.user", "user")
        .where("user.isActive = :isActive", { isActive: true })
        .getCount();
        
      const inactiveEmployees = totalEmployees - activeEmployees;
      
      return {
        total: totalEmployees,
        active: activeEmployees,
        inactive: inactiveEmployees
      };
    } catch (error) {
      throw createError(500, "Error fetching employee statistics");
    }
  }
}