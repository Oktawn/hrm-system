import createError from "http-errors";
import { positionRepository, departmentRepository } from "../db/db-rep";

export interface CreatePositionData {
  name: string;
  description?: string;
  baseSalary?: number;
  grade?: string;
  departmentId?: number;
}

export interface UpdatePositionData extends Partial<CreatePositionData> {}

export class PositionsService {
  async getAllPositions() {
    try {
      const positions = await positionRepository.find({
        relations: ["department", "employees"],
        order: { name: "ASC" }
      });
      return positions;
    } catch (error) {
      throw createError(500, "Error fetching positions");
    }
  }

  async getPositionById(id: number) {
    const position = await positionRepository.findOne({
      where: { id },
      relations: ["department", "employees"]
    });
    
    if (!position) {
      throw createError(404, "Position not found");
    }
    
    return position;
  }

  async createPosition(positionData: CreatePositionData) {
    const existingPosition = await positionRepository.findOne({
      where: { name: positionData.name }
    });
    
    if (existingPosition) {
      throw createError(400, "Position with this name already exists");
    }

    let department = null;
    if (positionData.departmentId) {
      department = await departmentRepository.findOne({
        where: { id: positionData.departmentId }
      });
      
      if (!department) {
        throw createError(404, "Department not found");
      }
    }

    const position = positionRepository.create({
      ...positionData,
      department
    });
    
    try {
      await positionRepository.save(position);
      return position;
    } catch (error) {
      throw createError(500, "Error creating position");
    }
  }

  async updatePosition(id: number, positionData: UpdatePositionData) {
    const position = await this.getPositionById(id);
    
    if (positionData.name) {
      const existingPosition = await positionRepository.findOne({
        where: { name: positionData.name }
      });
      
      if (existingPosition && existingPosition.id !== id) {
        throw createError(400, "Position with this name already exists");
      }
    }

    let department = position.department;
    if (positionData.departmentId !== undefined) {
      if (positionData.departmentId === null) {
        department = null;
      } else {
        department = await departmentRepository.findOne({
          where: { id: positionData.departmentId }
        });
        
        if (!department) {
          throw createError(404, "Department not found");
        }
      }
    }

    Object.assign(position, positionData, { department });
    
    try {
      await positionRepository.save(position);
      return position;
    } catch (error) {
      throw createError(500, "Error updating position");
    }
  }

  async deletePosition(id: number) {
    const position = await this.getPositionById(id);
    
    try {
      await positionRepository.remove(position);
    } catch (error) {
      throw createError(500, "Error deleting position");
    }
  }

  async getPositionsByDepartment(departmentId: number) {
    const department = await departmentRepository.findOne({
      where: { id: departmentId }
    });
    
    if (!department) {
      throw createError(404, "Department not found");
    }

    return await positionRepository.find({
      where: { department: { id: departmentId } },
      relations: ["employees"],
      order: { name: "ASC" }
    });
  }
}
