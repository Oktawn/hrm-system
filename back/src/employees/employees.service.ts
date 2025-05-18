import { employeeRepository, userRepository } from "../db/db-rep";
import { ICreateEmployee, IEmployeeFilter, IUpdateEmployee } from "./employee.interface";
import createError from "http-errors";



export class EmployeesService {
  async getAllEmployees(filter: IEmployeeFilter) {
    filter.page = filter.page || 1;
    filter.limit = filter.limit || 10;

    const queryB = employeeRepository.createQueryBuilder("employee");
    queryB.leftJoinAndSelect("employee.department", "department");
    queryB.leftJoinAndSelect("employee.position", "position");
    if (filter.firstName) {
      queryB.andWhere("employee.firstName LIKE :firstName", {
        firstName: `%${filter.firstName}%`,
      });
    }
    if (filter.lastName) {
      queryB.andWhere("employee.lastName LIKE :lastName", {
        lastName: `%${filter.lastName}%`,
      });
    }

    if (filter.departmentId) {
      queryB.andWhere("employee.departmentId = :departmentId", { departmentId: filter.departmentId });
    }

    if (filter.positionId) {
      queryB.andWhere("employee.positionId = :positionId", { positionId: filter.positionId });
    }

    const page = (filter.page - 1) * filter.limit;
    queryB.skip(page).take(filter.limit);
    const [employees, total] = await queryB.getManyAndCount();
    const modifiedEmployees = employees.map(employee => ({
      ...employee,
      user: employee.user ? { email: employee.user.email } : null
    }));
    return {
      data: modifiedEmployees,
      meta: {
        page: page,
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
    const userEmail = employee.user ? {
      id: employee.user.id,
      email: employee.user.email
    } : null;

    return {
      ...employee,
      user: userEmail
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
}