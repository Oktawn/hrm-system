import { DocumentStatusEnum, DocumentTypeEnum } from "../commons/enums/enums";

export interface ICreateDocument {
  type: DocumentTypeEnum;
  title: string;
  description?: string;
  content?: string;
  templatePath?: string;
  sourceRequestId: number;
  requestedById: string;
  createdById?: string;
  templateData?: any;
  metadata?: any;
}

export interface IUpdateDocument {
  id: number;
  title?: string;
  description?: string;
  content?: string;
  templatePath?: string;
  status?: DocumentStatusEnum;
  signedById?: string;
  rejectionReason?: string;
  templateData?: any;
  metadata?: any;
}

export interface IDocumentFilter {
  type?: DocumentTypeEnum | DocumentTypeEnum[];
  status?: DocumentStatusEnum | DocumentStatusEnum[];
  title?: string;
  requestedById?: string;
  createdById?: string;
  signedById?: string;
  sourceRequestId?: number;
  createdAtFrom?: Date;
  createdAtTo?: Date;
  signedAtFrom?: Date;
  signedAtTo?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IDocumentResponse {
  id: number;
  type: DocumentTypeEnum;
  title: string;
  description?: string;
  status: DocumentStatusEnum;
  content?: string;
  templatePath?: string;
  filePath?: string;
  fileUrl?: string;
  templateData?: any;
  sourceRequest: {
    id: number;
    title: string;
    type: string;
  };
  requestedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  signedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  signedAt?: Date;
  rejectionReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}
