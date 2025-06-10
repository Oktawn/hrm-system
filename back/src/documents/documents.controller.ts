import { Request, Response } from "express";
import { DocumentsService } from "./documents.service";
import { ICreateDocument, IUpdateDocument, IDocumentFilter } from "./documents.interface";
import { AuthenticatedRequest } from "../auth/auth.interface";
import { DocumentStatusEnum } from "../commons/enums/enums";

const documentsService = new DocumentsService();

export class DocumentsController {

  async createDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentData: ICreateDocument = req.body;

      if (!documentData.createdById) {
        documentData.createdById = req.user.userId;
      }

      const document = await documentsService.createDocument(documentData);

      res.status(201).json({
        success: true,
        data: document,
        message: "Документ успешно создан"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentData: IUpdateDocument = req.body;
      documentData.id = parseInt(req.params.id);

      const document = await documentsService.updateDocument(documentData, req.user.userId);

      res.status(200).json({
        success: true,
        data: document,
        message: "Документ успешно обновлен"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      await documentsService.deleteDocument(id, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Документ успешно удален"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDocumentById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const document = await documentsService.getDocumentById(id);

      res.status(200).json({
        success: true,
        data: document
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAllDocuments(req: Request, res: Response): Promise<void> {
    try {
      const filter: IDocumentFilter = req.query;
      const result = await documentsService.getAllDocuments(filter);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDocumentsByRequestedBy(req: Request, res: Response): Promise<void> {
    try {
      const { employeeId } = req.params;
      const documents = await documentsService.getDocumentsByRequestedBy(employeeId);

      res.status(200).json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDocumentsByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const documents = await documentsService.getDocumentsByStatus(status as DocumentStatusEnum);

      res.status(200).json({
        success: true,
        data: documents
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateDocumentStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.id);
      const { status } = req.body;

      if (!Object.values(DocumentStatusEnum).includes(status)) {
        res.status(400).json({
          success: false,
          message: "Недопустимый статус документа"
        });
        return;
      }

      const document = await documentsService.updateDocumentStatus(documentId, status as DocumentStatusEnum, req.user.userId);

      res.status(200).json({
        success: true,
        message: "Статус документа обновлен",
        data: document
      });
    } catch (error) {
      console.error('Error updating document status:', error);
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async generateDocumentFromRequest(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { requestId } = req.params;
      const document = await documentsService.generateDocumentFromRequest(
        parseInt(requestId),
        req.user.userId
      );

      res.status(201).json({
        success: true,
        data: document,
        message: "Документ успешно сгенерирован на основе заявки"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async signDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.id);

      const document = await documentsService.updateDocumentStatus(documentId, DocumentStatusEnum.SIGNED, req.user.userId);

      res.status(200).json({
        success: true,
        data: document,
        message: "Документ успешно подписан"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async rejectDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.id);
      const { rejectionReason } = req.body;

      const document = await documentsService.updateDocumentStatus(documentId, DocumentStatusEnum.REJECTED, req.user.userId);

      if (rejectionReason) {
        const updateData: IUpdateDocument = {
          id: documentId,
          rejectionReason: rejectionReason
        };
        await documentsService.updateDocument(updateData, req.user.userId);
      }

      res.status(200).json({
        success: true,
        data: document,
        message: "Документ отклонен"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }

  async regenerateDocument(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const documentId = parseInt(req.params.id);
      const additionalData = req.body.templateData || {};

      const document = await documentsService.regenerateDocument(
        documentId,
        req.user.userId,
        additionalData
      );

      res.status(200).json({
        success: true,
        data: document,
        message: "Документ успешно перегенерирован"
      });
    } catch (error) {
      res.status(error.status || 500).json({
        success: false,
        message: error.message
      });
    }
  }
}
