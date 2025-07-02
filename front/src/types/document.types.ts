export type FileAttachment = {
  filename: string;
  originalName: string;
  mimetype?: string;
  size: number;
  uploadDate: string;
};
export type FileUploadProps = {
  value?: FileAttachment[];
  onChange?: (files: FileAttachment[]) => void;
  maxFiles?: number;
  disabled?: boolean;
  showDownload?: boolean;
};

export type DocumentType = 'work_certificate'
  | 'salary_certificate'
  | 'employment_certificate'
  | 'vacation_certificate'
  | 'medical_certificate'
  | 'personal_data_extract'
  | 'contract_copy'
  | 'other';

export type DocumentStatus = 'under_review'
  | 'signed'
  | 'rejected'
  | 'expired'
  | 'draft';







export interface Document {
  id: number;
  type: DocumentType;
  title: string;
  description?: string;
  status: DocumentStatus;
  content?: string;
  templatePath?: string;
  filePath?: string;
  fileUrl?: string;
  templateData?: Record<string, any>;
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
  signedAt?: string;
  rejectionReason?: string;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilter {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  title?: string;
  requestedById?: string;
  createdById?: string;
  signedById?: string;
  sourceRequestId?: number;
  createdAtFrom?: string;
  createdAtTo?: string;
  signedAtFrom?: string;
  signedAtTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface CreateDocumentData {
  type: string;
  title: string;
  description?: string;
  content?: string;
  sourceRequestId: number;
  requestedById: string;
  templateData?: Record<string, any>;
  metadata?: any;
}

export interface UpdateDocumentData {
  title?: string;
  description?: string;
  content?: string;
  status?: string;
  rejectionReason?: string;
  templateData?: Record<string, any>;
  metadata?: any;
}