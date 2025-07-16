import createHttpError from "http-errors";
import { employeeRepository, requestRepository } from "../db/db-rep";
import { ICreateRequest, IRequestFilter, IUpdateRequest } from "./requests.interface";
import { RequestStatusEnum, UserRoleEnum } from "../commons/enums/enums";
import { DocumentsService } from "../documents/documents.service";

export class RequestsService {
  private documentsService = new DocumentsService();

  async createRequest(requestData: ICreateRequest) {
    const { userId, ...request } = requestData;

    if (['leave_vacation', 'leave_sick', 'leave_personal'].includes(request.type) && request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);
      const currentDate = new Date();

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(currentDate.getDate() + 3);
      threeDaysFromNow.setHours(0, 0, 0, 0);

      if (startDate < threeDaysFromNow) {
        throw createHttpError(400, "Отпуск нельзя подавать раньше чем за 3 дня от текущей даты");
      }

      if (request.type === 'leave_vacation') {
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays > 30) {
          throw createHttpError(400, "Оплачиваемый отпуск не может быть больше 30 дней");
        }
      }
    }

    const exEmployee = await employeeRepository.findOne({
      where: { id: userId },
    });
    if (!exEmployee) {
      throw createHttpError(404, "Employee not found");
    }
    const newRequest = requestRepository.create({
      ...request,
      creator: exEmployee
    });
    try {
      const savedRequest = await requestRepository.save(newRequest);

      await this.autoCreateDocument(savedRequest);

      return await this.getRequestById(savedRequest.id);
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
      relations: ["creator", "assignee", "creator.user", "assignee.user"]
    });
    if (!exRequest) {
      throw createHttpError(404, "Request not found");
    }
    return exRequest;
  }

  async getAllRequests(filet: IRequestFilter) {

    const { page, limit, sortBy, sortOrder, ...filter } = filet;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const sortOrderValue = sortOrder || 'DESC';

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

    if (sortBy) {
      const allowedSortFields = ['id', 'createdAt'];
      const sortField = allowedSortFields.includes(sortBy) ? `request.${sortBy}` : 'request.createdAt';
      queryB.orderBy(sortField, sortOrderValue);
    } else {
      queryB.orderBy("request.createdAt", "DESC");
    }

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
      relations: ["creator", "assignee", "creator.user", "assignee.user"],
      order: { createdAt: "DESC" }
    });
    if (!requests) {
      throw createHttpError(404, "Requests not found");
    }
    return requests;
  }

  async getRequestsByStatus(status: string) {
    const requests = await requestRepository.find({
      where: { status: RequestStatusEnum[status] },
      relations: ["creator", "assignee", "creator.user", "assignee.user"],
      order: { createdAt: "DESC" }
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

  private async autoCreateDocument(request: any) {
    const autoDocumentTypes = [
      'leave_vacation',   // Отпуск
      'leave_sick',       // Больничный
      'leave_personal',   // Отгул
      'document',         // Запрос документа
      'certificate'       // Запрос справки
    ];

    if (!autoDocumentTypes.includes(request.type)) {
      return;
    }

    try {
      const hrEmployee = await employeeRepository.findOne({
        where: { user: { role: UserRoleEnum.HR } },
        relations: ["user"]
      });

      if (!hrEmployee) {
        const adminEmployee = await employeeRepository.findOne({
          where: { user: { role: UserRoleEnum.ADMIN } },
          relations: ["user"]
        });

        if (!adminEmployee) {
          console.warn(`No HR or Admin employee found to create document for request ${request.id}`);
          return;
        }
        await this.documentsService.generateDocumentFromRequest(request.id, adminEmployee.user.id);
      } else {
        await this.documentsService.generateDocumentFromRequest(request.id, hrEmployee.user.id);
      }
    } catch (error) {
      console.error(`Failed to auto-create document for request ${request.id}:`, error.message);
    }
  }
}