import { Request, Response } from "express";
import { PositionsService, CreatePositionData, UpdatePositionData } from "./positions.service";
import createError from "http-errors";

export class PositionsController {
  private positionsService = new PositionsService();

  getAllPositions = async (req: Request, res: Response) => {
    try {
      const positions = await this.positionsService.getAllPositions();
      res.json({
        success: true,
        data: positions
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  getPositionById = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        throw createError(400, "Invalid position ID");
      }

      const position = await this.positionsService.getPositionById(id);
      res.json({
        success: true,
        data: position
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  createPosition = async (req: Request, res: Response) => {
    try {
      const positionData: CreatePositionData = req.body;
      
      if (!positionData.name || typeof positionData.name !== 'string') {
        throw createError(400, "Position name is required");
      }

      const position = await this.positionsService.createPosition({
        ...positionData,
        name: positionData.name.trim()
      });
      
      res.status(201).json({
        success: true,
        data: position,
        message: "Position created successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  updatePosition = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const positionData: UpdatePositionData = req.body;

      if (isNaN(id)) {
        throw createError(400, "Invalid position ID");
      }

      if (positionData.name && typeof positionData.name === 'string') {
        positionData.name = positionData.name.trim();
      }

      const position = await this.positionsService.updatePosition(id, positionData);
      res.json({
        success: true,
        data: position,
        message: "Position updated successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  deletePosition = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        throw createError(400, "Invalid position ID");
      }

      await this.positionsService.deletePosition(id);
      res.json({
        success: true,
        message: "Position deleted successfully"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };

  getPositionsByDepartment = async (req: Request, res: Response) => {
    try {
      const departmentId = parseInt(req.params.departmentId);
      
      if (isNaN(departmentId)) {
        throw createError(400, "Invalid department ID");
      }

      const positions = await this.positionsService.getPositionsByDepartment(departmentId);
      res.json({
        success: true,
        data: positions
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  };
}
