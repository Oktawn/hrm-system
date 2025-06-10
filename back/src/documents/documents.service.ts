import { documentRepository, employeeRepository, requestRepository } from "../db/db-rep";
import { ICreateDocument, IUpdateDocument, IDocumentFilter } from "./documents.interface";
import { DocumentStatusEnum, DocumentTypeEnum, UserRoleEnum, RequestStatusEnum } from "../commons/enums/enums";
import createHttpError from "http-errors";
import { DocumentTemplateService } from "./document-template.service";

export class DocumentsService {
  private templateService = new DocumentTemplateService();

  async createDocument(documentData: ICreateDocument) {
    const { sourceRequestId, requestedById, createdById, ...data } = documentData;

    const sourceRequest = await requestRepository.findOne({
      where: { id: sourceRequestId },
      relations: ["creator"]
    });
    if (!sourceRequest) {
      throw createHttpError(404, "Source request not found");
    }

    const requestedBy = await employeeRepository.findOne({
      where: { id: requestedById },
      relations: ["user"]
    });
    if (!requestedBy) {
      throw createHttpError(404, "Requested by employee not found");
    }

    let createdBy = null;
    if (createdById) {
      createdBy = await employeeRepository.findOne({
        where: { user: { id: createdById } },
        relations: ["user"]
      });

      if (!createdBy) {
        createdBy = await employeeRepository.findOne({
          where: { id: createdById },
          relations: ["user"]
        });
      }

      if (!createdBy) {
        throw createHttpError(404, "Created by employee not found");
      }
    }

    const newDocument = documentRepository.create({
      ...data,
      sourceRequest,
      requestedBy,
      createdBy,
      status: DocumentStatusEnum.UNDER_REVIEW
    });

    try {
      const savedDocument = await documentRepository.save(newDocument);
      return await this.getDocumentById(savedDocument.id);
    } catch (error) {
      throw createHttpError(500, "Error creating document");
    }
  }

  async updateDocument(documentData: IUpdateDocument, userId: string) {
    const { id, signedById, ...data } = documentData;

    const document = await this.getDocumentById(id);

    const currentEmployee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!currentEmployee) {
      throw createHttpError(404, "Employee not found");
    }

    const isCreator = document.createdBy?.id === currentEmployee.id;
    const isRequester = document.requestedBy.id === currentEmployee.id;
    const isManager = ['admin', 'hr', 'manager'].includes(currentEmployee.user.role);

    if (!isCreator && !isRequester && !isManager) {
      throw createHttpError(403, "Forbidden: You don't have permission to edit this document");
    }

    if (signedById && data.status === DocumentStatusEnum.SIGNED) {
      const signedBy = await employeeRepository.findOne({
        where: { id: signedById },
        relations: ["user"]
      });
      if (!signedBy) {
        throw createHttpError(404, "Signed by employee not found");
      }
      document.signedBy = signedBy;
      document.signedAt = new Date();
    }

    for (const key in data) {
      if (data[key] !== undefined) {
        document[key] = data[key];
      }
    }

    try {
      await documentRepository.save(document);
      return await this.getDocumentById(id);
    } catch (error) {
      throw createHttpError(500, "Error updating document");
    }
  }

  async deleteDocument(id: number, userId: string) {
    const document = await this.getDocumentById(id);

    const currentEmployee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!currentEmployee) {
      throw createHttpError(404, "Employee not found");
    }

    const isCreator = document.createdBy?.id === currentEmployee.id;
    const isManager = ['admin', 'hr'].includes(currentEmployee.user.role);

    if (!isCreator && !isManager) {
      throw createHttpError(403, "Forbidden: You don't have permission to delete this document");
    }

    try {
      await documentRepository.remove(document);
    } catch (error) {
      throw createHttpError(500, "Error deleting document");
    }
  }

  async getDocumentById(id: number) {
    const document = await documentRepository.findOne({
      where: { id },
      relations: [
        "sourceRequest",
        "requestedBy",
        "createdBy",
        "signedBy",
        "requestedBy.user",
        "createdBy.user",
        "signedBy.user"
      ]
    });

    if (!document) {
      throw createHttpError(404, "Document not found");
    }

    return document;
  }

  async getAllDocuments(filter: IDocumentFilter) {
    const { page, limit, sortBy, sortOrder, ...filterParams } = filter;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 10;
    const sortOrderValue = sortOrder || 'DESC';

    const queryBuilder = documentRepository.createQueryBuilder("document")
      .leftJoinAndSelect("document.sourceRequest", "sourceRequest")
      .leftJoinAndSelect("document.requestedBy", "requestedBy")
      .leftJoinAndSelect("document.createdBy", "createdBy")
      .leftJoinAndSelect("document.signedBy", "signedBy")
      .leftJoinAndSelect("requestedBy.user", "requestedByUser")
      .leftJoinAndSelect("createdBy.user", "createdByUser")
      .leftJoinAndSelect("signedBy.user", "signedByUser");

    if (filterParams.type) {
      if (Array.isArray(filterParams.type)) {
        queryBuilder.andWhere("document.type IN (:...types)", { types: filterParams.type });
      } else {
        queryBuilder.andWhere("document.type = :type", { type: filterParams.type });
      }
    }

    if (filterParams.status) {
      if (Array.isArray(filterParams.status)) {
        queryBuilder.andWhere("document.status IN (:...statuses)", { statuses: filterParams.status });
      } else {
        queryBuilder.andWhere("document.status = :status", { status: filterParams.status });
      }
    }

    if (filterParams.title) {
      queryBuilder.andWhere("document.title ILIKE :title", { title: `%${filterParams.title}%` });
    }

    if (filterParams.requestedById) {
      queryBuilder.andWhere("requestedBy.id = :requestedById", { requestedById: filterParams.requestedById });
    }

    if (filterParams.createdById) {
      queryBuilder.andWhere("createdBy.id = :createdById", { createdById: filterParams.createdById });
    }

    if (filterParams.signedById) {
      queryBuilder.andWhere("signedBy.id = :signedById", { signedById: filterParams.signedById });
    }

    if (filterParams.sourceRequestId) {
      queryBuilder.andWhere("sourceRequest.id = :sourceRequestId", { sourceRequestId: filterParams.sourceRequestId });
    }

    if (filterParams.createdAtFrom) {
      queryBuilder.andWhere("document.createdAt >= :createdAtFrom", { createdAtFrom: filterParams.createdAtFrom });
    }

    if (filterParams.createdAtTo) {
      queryBuilder.andWhere("document.createdAt <= :createdAtTo", { createdAtTo: filterParams.createdAtTo });
    }

    if (sortBy) {
      const allowedSortFields = ['id', 'title', 'createdAt', 'updatedAt', 'signedAt'];
      if (allowedSortFields.includes(sortBy)) {
        queryBuilder.orderBy(`document.${sortBy}`, sortOrderValue as 'ASC' | 'DESC');
      }
    } else {
      queryBuilder.orderBy('document.createdAt', 'DESC');
    }

    const totalCount = await queryBuilder.getCount();
    const documents = await queryBuilder
      .skip((pageNum - 1) * limitNum)
      .take(limitNum)
      .getMany();

    return {
      data: documents,
      meta: {
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    };
  }

  async getDocumentsByRequestedBy(employeeId: string) {
    const documents = await documentRepository.find({
      where: { requestedBy: { id: employeeId } },
      relations: [
        "sourceRequest",
        "requestedBy",
        "createdBy",
        "signedBy",
        "requestedBy.user",
        "createdBy.user",
        "signedBy.user"
      ],
      order: { createdAt: "DESC" }
    });

    return documents;
  }

  async getDocumentsByStatus(status: DocumentStatusEnum) {
    const documents = await documentRepository.find({
      where: { status },
      relations: [
        "sourceRequest",
        "requestedBy",
        "createdBy",
        "signedBy",
        "requestedBy.user",
        "createdBy.user",
        "signedBy.user"
      ],
      order: { createdAt: "DESC" }
    });

    return documents;
  }

  async updateDocumentStatus(documentId: number, status: DocumentStatusEnum, userId: string) {
    const document = await documentRepository.findOne({
      where: { id: documentId },
      relations: ["sourceRequest", "requestedBy", "createdBy", "signedBy", "requestedBy.user", "createdBy.user", "signedBy.user"]
    });

    if (!document) {
      throw createHttpError(404, "Document not found");
    }

    const employee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!employee) {
      throw createHttpError(404, "Employee not found");
    }

    const isCreator = document.createdBy?.id === employee.id;
    const isRequester = document.requestedBy.id === employee.id;
    const isManager = employee.user.role === UserRoleEnum.ADMIN ||
      employee.user.role === UserRoleEnum.HR ||
      employee.user.role === UserRoleEnum.MANAGER;

    if (!isCreator && !isRequester && !isManager) {
      throw createHttpError(403, "You don't have permission to change this document status");
    }

    if (status === DocumentStatusEnum.SIGNED) {
      document.signedBy = employee;
      document.signedAt = new Date();
    }

    document.status = status;
    await documentRepository.save(document);

    await this.updateRelatedRequestStatus(document, status);

    return await this.getDocumentById(documentId);
  }

  async generateDocumentFromRequest(requestId: number, userId: string) {
    const request = await requestRepository.findOne({
      where: { id: requestId },
      relations: [
        "creator",
        "creator.user",
        "creator.position",
        "creator.department"
      ]
    });

    if (!request) {
      throw createHttpError(404, "Request not found");
    }

    const createdBy = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!createdBy) {
      throw createHttpError(404, "Creator employee not found");
    }

    let documentType;
    let documentTitle;

    switch (request.type) {
      case 'document':
        documentType = DocumentTypeEnum.WORK_CERTIFICATE;
        documentTitle = `Справка с места работы - ${request.creator.firstName} ${request.creator.lastName}`;
        break;
      case 'certificate':
        documentType = DocumentTypeEnum.SALARY_CERTIFICATE;
        documentTitle = `Справка о доходах - ${request.creator.firstName} ${request.creator.lastName}`;
        break;
      case 'leave_vacation':
        documentType = DocumentTypeEnum.VACATION_CERTIFICATE;
        documentTitle = `Справка об отпуске - ${request.creator.firstName} ${request.creator.lastName}`;
        break;
      case 'leave_sick':
        documentType = DocumentTypeEnum.MEDICAL_CERTIFICATE;
        documentTitle = `Медицинская справка - ${request.creator.firstName} ${request.creator.lastName}`;
        break;
      case 'leave_personal':
        documentType = DocumentTypeEnum.WORK_CERTIFICATE; // Используем справку с места работы для отгулов
        documentTitle = `Справка о предоставлении отгула - ${request.creator.firstName} ${request.creator.lastName}`;
        break;
      default:
        documentType = DocumentTypeEnum.OTHER;
        documentTitle = `Документ по заявке: ${request.title}`;
        break;
    }

    let additionalTemplateData = {};

    if (request.type === 'leave_vacation') {
      additionalTemplateData = {
        vacationType: 'Ежегодный оплачиваемый отпуск',
        vacationStartDate: request.startDate ? new Date(request.startDate).toLocaleDateString('ru-RU') : '',
        vacationEndDate: request.endDate ? new Date(request.endDate).toLocaleDateString('ru-RU') : '',
        vacationDays: request.duration || '',
        vacationDetails: `Основание: ${request.title}. ${request.description || ''}`,
        usedVacationDays: 'По данным кадрового учета',
        remainingVacationDays: 'По данным кадрового учета',
        additionalVacationInfo: 'Отпуск предоставляется согласно графику отпусков и Трудовому кодексу РФ.'
      };
    } else if (request.type === 'leave_sick') {
      additionalTemplateData = {
        medicalInfo: `Основание: ${request.title}. ${request.description || ''}`,
        sickLeaveStartDate: request.startDate ? new Date(request.startDate).toLocaleDateString('ru-RU') : '',
        sickLeaveEndDate: request.endDate ? new Date(request.endDate).toLocaleDateString('ru-RU') : '',
        sickLeaveDays: request.duration || '',
        additionalMedicalInfo: 'Справка выдана на основании поданной заявки на больничный.'
      };
    } else if (request.type === 'leave_personal') {
      additionalTemplateData = {
        additionalInfo: `Сотруднику предоставлен неоплачиваемый отпуск (отгул) ${request.startDate ? 'с ' + new Date(request.startDate).toLocaleDateString('ru-RU') : ''}${request.endDate ? ' по ' + new Date(request.endDate).toLocaleDateString('ru-RU') : ''}.
Основание: ${request.title}. ${request.description || ''}
Продолжительность: ${request.duration || 'не указана'} дней.`
      };
    }

    const templateData = this.templateService.prepareTemplateData(
      request.creator,
      request,
      {
        hrManagerName: `${createdBy.firstName} ${createdBy.lastName}`,
        signerName: `${createdBy.firstName} ${createdBy.lastName}`,
        ...additionalTemplateData
      }
    );

    const documentData: ICreateDocument = {
      type: documentType,
      title: documentTitle,
      description: `Документ создан на основе заявки #${request.id}: ${request.title}`,
      sourceRequestId: request.id,
      requestedById: request.creator.id,
      createdById: createdBy.id,
      templateData: templateData
    };

    const newDocument = documentRepository.create({
      ...documentData,
      sourceRequest: request,
      requestedBy: request.creator,
      createdBy: createdBy,
      status: DocumentStatusEnum.UNDER_REVIEW
    });

    const savedDocument = await documentRepository.save(newDocument);

    try {
      const documentFile = await this.templateService.generateDocument(
        documentType,
        templateData,
        savedDocument.id
      );

      savedDocument.content = documentFile.content;
      savedDocument.filePath = documentFile.filePath;
      savedDocument.fileUrl = documentFile.fileUrl;
      savedDocument.templatePath = this.templateService.getTemplatePath(documentType);

      await documentRepository.save(savedDocument);

      return await this.getDocumentById(savedDocument.id);
    } catch (error) {
      await documentRepository.remove(savedDocument);
      throw createHttpError(500, `Error generating document: ${error.message}`);
    }
  }

  async regenerateDocument(documentId: number, userId: string, additionalData: Record<string, any> = {}) {
    const document = await this.getDocumentById(documentId);

    const currentEmployee = await employeeRepository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!currentEmployee) {
      throw createHttpError(404, "Employee not found");
    }

    const isCreator = document.createdBy?.id === currentEmployee.id;
    const isManager = ['admin', 'hr'].includes(currentEmployee.user.role);

    if (!isCreator && !isManager) {
      throw createHttpError(403, "Forbidden: You don't have permission to regenerate this document");
    }

    if (document.filePath) {
      await this.templateService.deleteDocument(document.filePath);
    }

    const updatedTemplateData = {
      ...document.templateData,
      ...additionalData
    };

    const documentFile = await this.templateService.generateDocument(
      document.type,
      updatedTemplateData,
      document.id
    );

    document.content = documentFile.content;
    document.filePath = documentFile.filePath;
    document.fileUrl = documentFile.fileUrl;
    document.templateData = updatedTemplateData;

    await documentRepository.save(document);

    return await this.getDocumentById(documentId);
  }

  private async updateRelatedRequestStatus(document: any, documentStatus: DocumentStatusEnum): Promise<void> {
    if (!document.sourceRequest) {
      return;
    }

    const request = document.sourceRequest;
    let newRequestStatus: RequestStatusEnum | null = null;

    switch (documentStatus) {
      case DocumentStatusEnum.SIGNED:
        newRequestStatus = RequestStatusEnum.APPROVED;
        break;

      case DocumentStatusEnum.REJECTED:
        newRequestStatus = RequestStatusEnum.REJECTED;
        break;

      case DocumentStatusEnum.UNDER_REVIEW:
        if (request.status === RequestStatusEnum.PENDING) {
          newRequestStatus = RequestStatusEnum.APPROVED;
        }
        break;

      default:
        return;
    }

    if (newRequestStatus && request.status !== newRequestStatus) {
      request.status = newRequestStatus;
      await requestRepository.save(request);
    }
  }
}
