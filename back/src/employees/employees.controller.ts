import { Request, Response, NextFunction } from 'express';
import { EmployeesService } from "./employees.service";
import { ICreateEmployee, IUpdateEmployee } from './employee.interface';
import { AuthenticatedRequest } from '../auth/auth.interface';

const employeeService = new EmployeesService();

export class EmployeesController {

  async getAllEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const filter = req.query;
      const employees = await employeeService.getAllEmployees(filter);
      res.status(200).json(employees);
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await employeeService.getEmployeeById(id);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeData = req.body as ICreateEmployee;
      const newEmployee = await employeeService.createEmployee(employeeData);
      res.status(201).json({
        success: true,
        message: "Employee created successfully",
        data: newEmployee,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateEmployee(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const employeeData = req.body as IUpdateEmployee;
      employeeData.userId = req.user.userId;
      await employeeService.updateEmployee(employeeData);
      res.status(200).json({
        message: "Employee updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateAnotherEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeData = req.body as IUpdateEmployee;
      await employeeService.updateEmployee(employeeData);
      res.status(200).json({
        message: "Employee updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await employeeService.deleteEmployee(id);
      res.status(200).json({
        message: "Employee deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const employee = await employeeService.getEmployeeById(req.user.userId);
      res.status(200).json(employee);
    } catch (error) {
      next(error);
    }
  }

  async getAvailableManagers(req: Request, res: Response, next: NextFunction) {
    try {
      const managers = await employeeService.getAvailableManagers();
      res.status(200).json({
        success: true,
        data: managers
      });
    } catch (error) {
      next(error);
    }
  }

  async getEmployeeStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await employeeService.getEmployeeStats();
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}