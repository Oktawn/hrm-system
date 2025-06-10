// Утилиты для работы со статусами и приоритетами задач и заявок

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
 * Приоритеты (используются для задач и заявок)
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
 * Цвета приоритетов для CSS (для компонентов, которые используют background-color)
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
    case 'vacation': return 'Отпуск';
    case 'leave_sick': return 'Больничный';
    case 'sick_leave': return 'Больничный';
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
    case 'manager': return 'blue';
    case 'employee': return 'green';
    default: return 'default';
  }
};

export const getRoleText = (role: string) => {
  switch (role) {
    case 'admin': return 'Администратор';
    case 'hr': return 'HR';
    case 'manager': return 'Менеджер';
    case 'employee': return 'Сотрудник';
    default: return role;
  }
};
