/**
 * Статусы задач
 */
export const getTaskStatusColor = (status: string): string => {
  switch (status) {
    case 'todo': return 'default';
    case 'in_progress': return 'processing';
    case 'review': return 'warning';
    case 'done': return 'success';
    case 'cancelled': return 'error';
    default: return 'default';
  }
};

export const getTaskStatusText = (status: string): string => {
  switch (status) {
    case 'todo': return 'К выполнению';
    case 'in_progress': return 'В работе';
    case 'review': return 'На проверке';
    case 'done': return 'Выполнено';
    case 'cancelled': return 'Отменено';
    default: return status;
  }
};

/**
 * Статусы заявок
 */
export const getRequestStatusColor = (status: string): string => {
  switch (status) {
    case 'pending': return 'warning';
    case 'approved': return 'success';
    case 'rejected': return 'error';
    case 'completed': return 'success';
    case 'cancelled': return 'default';
    default: return 'default';
  }
};

export const getRequestStatusText = (status: string): string => {
  switch (status) {
    case 'pending': return 'На рассмотрении';
    case 'approved': return 'Одобрено';
    case 'rejected': return 'Отклонено';
    case 'completed': return 'Выполнено';
    case 'cancelled': return 'Отменено';
    default: return status;
  }
};

/**
 * Приоритеты 
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'red';
    case 'high': return 'orange';
    case 'medium': return 'blue';
    case 'low': return 'green';
    default: return 'default';
  }
};

export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

/**
 * Цвета приоритетов
 */
export const getPriorityCSSColor = (priority: string): string => {
  switch (priority) {
    case 'low': return '#28a745';
    case 'medium': return '#ffc107';
    case 'high': return '#fd7e14';
    case 'critical': return '#dc3545';
    default: return '#6c757d';
  }
};

/**
 * Типы заявок
 */
export const getRequestTypeText = (type: string): string => {
  switch (type) {
    case 'document': return 'Документ';
    case 'certificate': return 'Справка';
    case 'leave_vacation': return 'Отпуск';
    case 'leave_sick': return 'Больничный';
    case 'leave_personal': return 'Неоплачиваемый отпуск';
    case 'business_trip': return 'Командировка';
    case 'remote_work': return 'Удаленная работа';
    case 'equipment': return 'Оборудование';
    case 'other': return 'Другое';
    default: return type;
  }
};

/**
 * Универсальные функции для получения статуса в зависимости от типа
 */
export const getStatusColor = (status: string, type: 'task' | 'request'): string => {
  return type === 'task' ? getTaskStatusColor(status) : getRequestStatusColor(status);
};

export const getStatusText = (status: string, type: 'task' | 'request'): string => {
  return type === 'task' ? getTaskStatusText(status) : getRequestStatusText(status);
};


export const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin': return 'red';
    case 'hr': return 'purple';
    case 'hr_director': return 'magenta';
    case 'head': return 'orange';
    case 'manager': return 'blue';
    case 'employee': return 'green';
    default: return 'default';
  }
};

export const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Администратор';
    case 'hr': return 'HR';
    case 'hr_director': return 'Директор по персоналу';
    case 'head': return 'Руководитель отдела';
    case 'manager': return 'Менеджер';
    case 'employee': return 'Сотрудник';
    default: return role;
  }
};

/**
 * Статусы документов
 */
export const getDocumentStatusColor = (status: string): string => {
  switch (status) {
    case 'under_review': return 'warning';
    case 'signed': return 'success';
    case 'rejected': return 'error';
    case 'expired': return 'default';
    case 'draft': return 'processing';
    default: return 'default';
  }
};

export const getDocumentStatusText = (status: string): string => {
  switch (status) {
    case 'under_review': return 'На рассмотрении';
    case 'signed': return 'Подписан';
    case 'rejected': return 'Отказано';
    case 'expired': return 'Истёк срок';
    case 'draft': return 'Черновик';
    default: return status;
  }
};

/**
 * Типы документов
 */
export const getDocumentTypeText = (type: string): string => {
  switch (type) {
    case 'work_certificate': return 'Справка с места работы';
    case 'salary_certificate': return 'Справка о доходах';
    case 'employment_certificate': return 'Справка о трудоустройстве';
    case 'vacation_certificate': return 'Справка об отпуске';
    case 'medical_certificate': return 'Медицинская справка';
    case 'personal_data_extract': return 'Выписка из личного дела';
    case 'contract_copy': return 'Копия трудового договора';
    case 'other': return 'Другое';
    default: return type;
  }
};

export const getDocumentTypeColor = (type: string): string => {
  switch (type) {
    case 'work_certificate': return 'blue';
    case 'salary_certificate': return 'green';
    case 'employment_certificate': return 'purple';
    case 'vacation_certificate': return 'orange';
    case 'medical_certificate': return 'red';
    case 'personal_data_extract': return 'geekblue';
    case 'contract_copy': return 'magenta';
    case 'other': return 'default';
    default: return 'default';
  }
};

/** 
 * Все перечисления статусов, ролей и типов заявок
 * Используются для унификации и упрощения работы с типами в приложении
 */

export const UserRoleEnum = {
  ADMIN: "admin",
  HEAD: "head", // Руководитель отдела
  HR_DIRECTOR: "hr_director", // Директор по персоналу
  HR: "hr",
  MANAGER: "manager",
  EMPLOYEE: "employee"
}

export const RequestStatusEnum = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
}

export const RequestTypeEnum = {
  DOCUMENT: "document",       // Запрос документа
  CERTIFICATE: "certificate", // Запрос справки
  LEAVE_VACATION: "leave_vacation", // Отпуск
  LEAVE_SICK: "leave_sick",   // Больничный
  LEAVE_PERSONAL: "leave_personal", // Отгул
  BUSINESS_TRIP: "business_trip", // Командировка
  REMOTE_WORK: "remote_work", // Удаленная работа
  EQUIPMENT: "equipment",    // Оборудование
  OTHER: "other"             // Другое
}

export const DocumentStatusEnum = {
  UNDER_REVIEW: "under_review",  // На рассмотрении
  SIGNED: "signed",              // Подписан
  REJECTED: "rejected",          // Отказано
  EXPIRED: "expired",           // Истёк срок
  DRAFT: "draft"                // Черновик
}

export const DocumentTypeEnum = {
  WORK_CERTIFICATE: "work_certificate",           // Справка с места работы
  SALARY_CERTIFICATE: "salary_certificate",      // Справка о доходах
  EMPLOYMENT_CERTIFICATE: "employment_certificate", // Справка о трудоустройстве
  VACATION_CERTIFICATE: "vacation_certificate",  // Справка об отпуске
  MEDICAL_CERTIFICATE: "medical_certificate",    // Медицинская справка
  PERSONAL_DATA_EXTRACT: "personal_data_extract", // Выписка из личного дела
  CONTRACT_COPY: "contract_copy",                 // Копия трудового договора
  OTHER: "other"                                  // Другое
}

export const TaskStatusEnum = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  DONE: "done",
  CANCELLED: "cancelled"
}

export const TaskPriorityEnum = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
}