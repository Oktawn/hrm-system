import { Request, Response } from "express";
import { DepartmentsService } from "./departments.service";
import createError from "http-errors";

export class DepartmentsController {
  private departmentsService = new DepartmentsService();

  getAllDepartments = async (req: Request, res: Response) => {
    try {
      const departments = await this.departmentsService.getAllDepartments();
      res.json({
        success: true,
        data: departments
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  getDepartmentById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw createError(400, "Invalid department ID");
      }

      const department = await this.departmentsService.getDepartmentById(id);
      res.json({
        success: true,
        data: department
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  createDepartment = async (req: Request, res: Response) => {
    try {
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        throw createError(400, "Department name is required");
      }

      const department = await this.departmentsService.createDepartment(name.trim());
      res.status(201).json({
        success: true,
        data: department,
        message: "Department created successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  updateDepartment = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { name } = req.body;

      if (isNaN(id)) {
        throw createError(400, "Invalid department ID");
      }

      if (!name || typeof name !== 'string') {
        throw createError(400, "Department name is required");
      }

      const department = await this.departmentsService.updateDepartment(id, name.trim());
      res.json({
        success: true,
        data: department,
        message: "Department updated successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  deleteDepartment = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw createError(400, "Invalid department ID");
      }

      await this.departmentsService.deleteDepartment(id);
      res.json({
        success: true,
        message: "Department deleted successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  getDepartmentStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.departmentsService.getDepartmentStats();
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  getEmployeeDepartmentStats = async (req: Request, res: Response) => {
    try {
      const employeeId = req.params.employeeId;
      if (!employeeId) {
        res.status(400).json({
          success: false,
          message: "Employee ID is required"
        });
        return;
      }

      const stats = await this.departmentsService.getEmployeeDepartmentStats(employeeId);
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };
}
