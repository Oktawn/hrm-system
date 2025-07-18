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

export const getPriorityText = (priority: string): string => {
  switch (priority) {
    case 'critical': return 'Критический';
    case 'high': return 'Высокий';
    case 'medium': return 'Средний';
    case 'low': return 'Низкий';
    default: return priority;
  }
};

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

export const escapeSpecialChars = (text: string) => {
  const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
  return text.split('').map(char => {
    if (specialChars.includes(char)) {
      return '\\' + char;
    }
    return char;
  }).join('');
}