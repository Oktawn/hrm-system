import { api } from "./auth.service";


export interface Document {
  id: number;
  type: 'work_certificate' | 'salary_certificate' | 'employment_certificate' | 'vacation_certificate' | 'medical_certificate' | 'personal_data_extract' | 'contract_copy' | 'other';
  title: string;
  description?: string;
  status: 'under_review' | 'signed' | 'rejected' | 'expired' | 'draft';
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

class DocumentsService {
  async getAll(filter: DocumentFilter = {}): Promise<{
    success: boolean;
    data: Document[];
    meta?: { page: number; limit: number; total: number; totalPages: number; };
  }> {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/documents?${params.toString()}`);
    return response.data;
  }

  async getById(id: number): Promise<{ success: boolean; data: Document }> {
    const response = await api.get(`/documents/${id}`);
    return response.data;
  }

  async getByEmployee(employeeId: string): Promise<{ success: boolean; data: Document[] }> {
    const response = await api.get(`/documents/employee/${employeeId}`);
    return response.data;
  }

  async getByStatus(status: string): Promise<{ success: boolean; data: Document[] }> {
    const response = await api.get(`/documents/status/${status}`);
    return response.data;
  }

  async create(documentData: CreateDocumentData): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.post('/documents', documentData);
    return response.data;
  }

  async generateFromRequest(requestId: number): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.post(`/documents/generate/${requestId}`);
    return response.data;
  }

  async regenerate(id: number, templateData?: Record<string, any>): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.post(`/documents/${id}/regenerate`, { templateData });
    return response.data;
  }

  async update(id: number, documentData: UpdateDocumentData): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.put(`/documents/${id}`, documentData);
    return response.data;
  }

  async updateStatus(id: number, status: string): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.patch(`/documents/${id}/status`, { status });
    return response.data;
  }

  async sign(id: number): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.patch(`/documents/${id}/sign`);
    return response.data;
  }

  async reject(id: number, rejectionReason: string): Promise<{ success: boolean; data: Document; message?: string }> {
    const response = await api.patch(`/documents/${id}/reject`, { rejectionReason });
    return response.data;
  }

  async delete(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
  }

  async downloadDocument(fileUrl: string): Promise<void> {
    try {
      const filename = fileUrl.split('/').pop();
      if (!filename) {
        throw new Error('Invalid file URL');
      }

      const response = await api.get(`/uploads/download/${filename}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  }
}

export default new DocumentsService();