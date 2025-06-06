import { employeeRepository, userRepository } from "../db/db-rep";
import { ICreateEmployee, IEmployeeFilter, IUpdateEmployee } from "./employee.interface";
import createError from "http-errors";



export class EmployeesService {
  async getAllEmployees(filter: IEmployeeFilter) {
    filter.page = filter.page || 1;
    filter.limit = filter.limit || 100; // Увеличиваем лимит по умолчанию

    const queryB = employeeRepository.createQueryBuilder("employee");
    queryB.leftJoinAndSelect("employee.department", "department");
    queryB.leftJoinAndSelect("employee.position", "position");
    queryB.leftJoinAndSelect("employee.user", "user");
    
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

    // Сортировка по фамилии и имени
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
      relations: ["department", "position", "user"],
    });
    if (!employee) {
      throw createError(404, "Employee not found");
    }
    const user = employee.user ? {
      id: employee.user.id,
      email: employee.user.email
    } : null;

    return {
      ...employee,
      user: user
    };
  }

  async createEmployee(employeeData: ICreateEmployee) {
    const { email, ...data } = employeeData;
    const findUser = await userRepository.findOne({
      where: { email: email },
    });
    const findEmployee = await employeeRepository.findOne({
      where: { user: { id: findUser.id } },
    });
    if (!findUser || findEmployee) {
      throw createError(404, "User not found");
    }
    const newEmployee = employeeRepository.create({
      ...data,
      user: findUser,
    })
    try {
      employeeRepository.save(newEmployee);
    } catch (error) {
      throw createError(500, "Error creating employee");
    }
  }

  async updateEmployee(employeeData: IUpdateEmployee) {
    const { userId, email, ...data } = employeeData;
    const findEmployee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"],
    });
    if (!findEmployee) {
      throw createError(404, "Employee not found");
    }
    try {
      if (email) {
        const findUser = await userRepository.findOne({
          where: { id: userId }
        });
        findUser.email = email;
        userRepository.save(findUser);
      }
      for (const key in data) {
        if (data[key] !== undefined) {
          findEmployee[key] = data[key];
        }
      }
      employeeRepository.save(findEmployee);

    } catch (error) {
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

  async getEmployeeStats() {
    try {
      const totalEmployees = await employeeRepository.count();
      
      // Считаем активных и неактивных сотрудников
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