import createHttpError from "http-errors";
import { employeeRepository, requestRepository } from "../db/db-rep";
import { ICreateRequest, IRequestFilter, IUpdateRequest } from "./requests.interface";
import { RequestStatusEnum, TaskPriorityEnum, UserRoleEnum } from "../commons/enums/enums";

export class RequestsService {

  async createRequest(requestData: ICreateRequest) {
    const { userId, ...request } = requestData;
    const exEmployee = await employeeRepository.findOne({
      where: { id: userId },
    });
    if (!exEmployee) {
      throw new Error("Employee not found");
    }
    const newRequest = requestRepository.create({
      ...request,
      creator: exEmployee
    });
    try {
      await requestRepository.save(newRequest);
    } catch (error) {
      throw createHttpError(500, "Error creating request");
    }
  }

  async updateRequest(requestData: IUpdateRequest, creatorId: string) {
    const { id, ...data } = requestData;
    const exRequest = await this.getRequestById(id);
    if (creatorId !== exRequest.creator.id &&
      exRequest.creator.user.role !== UserRoleEnum.EMPLOYEE) {
      throw createHttpError(403, "Forbidden");
    }
    for (const key in data) {
      if (data[key] !== undefined) {
        exRequest[key] = data[key];
      }
    }
    try {
      await requestRepository.save(exRequest);
    } catch (error) {
      throw createHttpError(500, "Error updating request");
    }
  }

  async deleteRequest(id: number, creatorId: string) {
    const request = await this.getRequestById(id);
    const exCreator = await employeeRepository.findOne({
      where: { user: { id: creatorId } },
      relations: ["user"]
    });
    if (exCreator.id === request.creator.id ||
      exCreator.user.role !== UserRoleEnum.EMPLOYEE) {
      try {
        await requestRepository.remove(request);
      } catch (error) {
        throw createHttpError(500, "Error deleting request");
      }
    } else {
      throw createHttpError(403, "Forbidden");
    }
  }

  async getRequestById(id: number) {
    const exRequest = await requestRepository.findOne({
      where: { id },
      relations: ["creator"]
    });
    if (!exRequest) {
      throw createHttpError(404, "Request not found");
    }
    return exRequest;
  }

  async getAllRequests(filet: IRequestFilter) {

    const { page, limit, ...filter } = filet;
    
    // Обеспечиваем, что page и limit являются числами
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    
    const queryB = requestRepository.createQueryBuilder("request")
      .leftJoinAndSelect("request.creator", "creator");

    if (filter.type) {
      if (Array.isArray(filter.type)) {
        queryB.andWhere("request.type IN (:...types)", { types: filter.type });
      } else {
        queryB.andWhere("request.type = :type", { type: filter.type });
      }
    }
    if (filter.status) {
      if (Array.isArray(filter.status)) {
        queryB.andWhere("request.status IN (:...statuses)", { statuses: filter.status });
      } else {
        queryB.andWhere("request.status = :status", { status: filter.status });
      }
    }
    if (filter.employeeId) {
      queryB.andWhere("creator.id = :employeeId", { employeeId: filter.employeeId });
    }

    if (filter.startDateFrom) {
      queryB.andWhere("request.startDate >= :startDateFrom", { startDateFrom: filter.startDateFrom });
    }
    if (filter.startDateTo) {
      queryB.andWhere("request.startDate <= :startDateTo", { startDateTo: filter.startDateTo });
    }
    if (filter.endDateFrom) {
      queryB.andWhere("request.endDate >= :endDateFrom", { endDateFrom: filter.endDateFrom });
    }
    if (filter.endDateTo) {
      queryB.andWhere("request.endDate <= :endDateTo", { endDateTo: filter.endDateTo });
    }
    queryB.orderBy("request.createdAt", "DESC");
    queryB.skip((pageNum - 1) * limitNum).take(limitNum);
    const [requests, total] = await queryB.getManyAndCount();

    return {
      data: requests,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  async getAllRequestsByEmployeeId(employeeId: string) {
    const requests = await requestRepository.find({
      where: { creator: { id: employeeId } },
      relations: ["creator"]
    });
    if (!requests) {
      throw createHttpError(404, "Requests not found");
    }
    return requests;
  }

  async getRequestsByStatus(status: string) {
    const requests = await requestRepository.find({
      where: { status: RequestStatusEnum[status] },
      relations: ["creator", "assignee"]
    });
    if (!requests) {
      throw createHttpError(404, "Requests not found");
    }
    return requests;
  }

  async updateRequestStatus(requestId: number, status: RequestStatusEnum, userId: string) {
    const request = await requestRepository.findOne({
      where: { id: requestId },
      relations: ["creator", "assignee", "creator.user", "assignee.user"]
    });

    if (!request) {
      throw createHttpError(404, "Request not found");
    }

    const employee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    // Проверяем права на изменение статуса
    const isCreator = request.creator?.id === employee.id;
    const isAssignee = request.assignee?.id === employee.id;
    const isManager = employee.user.role === UserRoleEnum.ADMIN || 
                     employee.user.role === UserRoleEnum.HR || 
                     employee.user.role === UserRoleEnum.MANAGER;

    if (!isCreator && !isAssignee && !isManager) {
      throw createHttpError(403, "You don't have permission to change this request status");
    }

    request.status = status;
    await requestRepository.save(request);

    return await this.getRequestById(requestId);
  }
}