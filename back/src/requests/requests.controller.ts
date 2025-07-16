import { AuthenticatedRequest, AuthenticatedRequestBot } from "../auth/auth.interface";
import { IUpdateRequest } from "./requests.interface";
import { RequestsService } from "./requests.service";
import { Request, Response } from "express";
import { uploadMultiple, createAttachment } from '../middleware/upload.middleware';

const requestsService = new RequestsService();

export class RequestsController {
  async createRequest(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    uploadMultiple(req, res, async (err: any) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      try {
        const requestData = req.body;

        let attachments = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
          attachments = (req.files as Express.Multer.File[]).map(createAttachment);
        }

        const requestDataWithAttachments = {
          ...requestData,
          attachments: attachments.length > 0 ? attachments : undefined
        };

        const createdRequest = await requestsService.createRequest(requestDataWithAttachments);
        res.status(201).json({
          success: true,
          data: createdRequest,
          message: 'Заявка успешно создана'
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });
  }

  async updateRequest(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const requestData = req.body as IUpdateRequest;
      requestData.id = parseInt(req.params.id);
      const creatorId = req.user.userId ? req.user.userId : req.bot?.userId;
      await requestsService.updateRequest(requestData, creatorId);
      res.status(200).json({ message: "Request updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteRequest(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const { id } = req.params;
      const creatorId = req.user.userId ? req.user.userId : req.bot?.userId;
      await requestsService.deleteRequest(parseInt(id), creatorId);
      res.status(200).json({ message: "Request deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const request = await requestsService.getRequestById(parseInt(id));
      res.status(200).json({
        success: true,
        data: request
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getAllRequests(req: Request, res: Response) {
    try {
      const filter = req.query;
      const requests = await requestsService.getAllRequests(filter);
      res.status(200).json({
        success: true,
        ...requests
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const requests = await requestsService.getRequestsByStatus(status);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async getRequestsByEmployeeId(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const requests = await requestsService.getAllRequestsByEmployeeId(employeeId);
      res.status(200).json({
        success: true,
        data: requests
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateRequestStatus(req: AuthenticatedRequest & AuthenticatedRequestBot, res: Response) {
    try {
      const requestId = parseInt(req.params.id);
      const { status } = req.body;
      const userId = req.user.userId ? req.user.userId : req.bot?.userId;
      const request = await requestsService.updateRequestStatus(requestId, status, userId);
      res.status(200).json({
        success: true,
        message: "Request status updated successfully",
        data: request
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}