import createError from "http-errors";
import { departmentRepository, employeeRepository } from "../db/db-rep";

export class DepartmentsService {
  async getAllDepartments() {
    try {
      const departments = await departmentRepository.find({
        relations: ["employees", "positions"],
        order: { name: "ASC" }
      });
      return departments;
    } catch (error) {
      throw createError(500, "Error fetching departments");
    }
  }

  async getDepartmentById(id: number) {
    const department = await departmentRepository.findOne({
      where: { id },
      relations: ["employees", "positions"]
    });

    if (!department) {
      throw createError(404, "Department not found");
    }

    return department;
  }

  async createDepartment(name: string) {
    const existingDepartment = await departmentRepository.findOne({
      where: { name }
    });

    if (existingDepartment) {
      throw createError(400, "Department with this name already exists");
    }

    const department = departmentRepository.create({ name });

    try {
      await departmentRepository.save(department);
      return department;
    } catch (error) {
      throw createError(500, "Error creating department");
    }
  }

  async updateDepartment(id: number, name: string) {
    const department = await this.getDepartmentById(id);

    const existingDepartment = await departmentRepository.findOne({
      where: { name }
    });

    if (existingDepartment && existingDepartment.id !== id) {
      throw createError(400, "Department with this name already exists");
    }

    department.name = name;

    try {
      await departmentRepository.save(department);
      return department;
    } catch (error) {
      throw createError(500, "Error updating department");
    }
  }

  async deleteDepartment(id: number) {
    const department = await this.getDepartmentById(id);

    try {
      await departmentRepository.remove(department);
    } catch (error) {
      throw createError(500, "Error deleting department");
    }
  }

  async getDepartmentStats() {
    const departments = await departmentRepository.find({
      relations: ["employees"]
    });

    return departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      employeeCount: dept.employees?.length || 0
    }));
  }

  async getEmployeeDepartmentStats(employeeId: string) {
    try {
      const employee = await employeeRepository.findOne({
        where: { id: employeeId },
        relations: ["department"]
      });
      const department = await departmentRepository.findOne({
        where: { id: employee.department.id },
        relations: ["employees"]
      });

      if (!employee || !employee.department) {
        throw createError(404, "Employee department not found");
      }

      return {
        id: department.id,
        name: department.name,
        employeeCount: department.employees?.length || 0
      };
    } catch (error) {
      throw createError(500, "Error fetching employee department stats");
    }
  }
}
