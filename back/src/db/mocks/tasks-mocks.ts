import { faker } from '@faker-js/faker';
import { employees, employeeRoles } from './employees-mocks';
import { TaskStatusEnum, TaskPriorityEnum, UserRoleEnum } from '../../commons/enums/enums';

const TASK_COUNT = 500;
const tasks = [];
const now = new Date();
const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

const generateTaskContent = () => {
  const taskTypes = [
    {
      title: 'Разработка функционала',
      descriptions: [
        'Разработать новый модуль для системы управления пользователями',
        'Реализовать функцию экспорта данных в Excel',
        'Создать API для интеграции с внешними системами',
        'Добавить валидацию форм на frontend'
      ]
    },
    {
      title: 'Тестирование',
      descriptions: [
        'Провести тестирование нового функционала',
        'Написать автотесты для API',
        'Выполнить регрессионное тестирование',
        'Протестировать интеграцию с внешними сервисами'
      ]
    },
    {
      title: 'Исправление ошибок',
      descriptions: [
        'Исправить баг с авторизацией пользователей',
        'Устранить проблему с загрузкой файлов',
        'Исправить ошибки валидации данных',
        'Решить проблему с производительностью запросов'
      ]
    },
    {
      title: 'Документация',
      descriptions: [
        'Написать техническую документацию для API',
        'Обновить пользовательскую документацию',
        'Создать инструкцию по развертыванию',
        'Документировать процесс разработки'
      ]
    },
    {
      title: 'Административные задачи',
      descriptions: [
        'Подготовить отчет о проделанной работе',
        'Провести код-ревью для коллег',
        'Обновить зависимости проекта',
        'Настроить CI/CD pipeline'
      ]
    }
  ];

  const taskType = faker.helpers.arrayElement(taskTypes);
  return {
    title: taskType.title,
    description: faker.helpers.arrayElement(taskType.descriptions)
  };
};

for (let i = 0; i < TASK_COUNT; i++) {
  const creators = employees.filter(emp => {
    const role = employeeRoles.get(emp.userId);
    return role === UserRoleEnum.HEAD || role === UserRoleEnum.MANAGER || role === UserRoleEnum.ADMIN || role === UserRoleEnum.HR;
  });
  const creator = faker.helpers.arrayElement(creators);

  const createdAt = faker.date.between({ from: twoYearsAgo, to: now });

  const deadline = faker.date.between({
    from: createdAt,
    to: new Date(createdAt.getTime() + faker.number.int({ min: 1, max: 60 }) * 24 * 60 * 60 * 1000)
  });

  const taskContent = generateTaskContent();

  const status = faker.helpers.arrayElement(Object.values(TaskStatusEnum));

  const priority = faker.helpers.arrayElement(Object.values(TaskPriorityEnum));

  const departmentEmployees = employees.filter(emp => emp.departmentId === creator.departmentId);
  const assigneesCount = faker.number.int({ min: 1, max: Math.min(3, departmentEmployees.length) });
  const assignees = faker.helpers.shuffle(departmentEmployees).slice(0, assigneesCount);

  const attachments = faker.datatype.boolean(0.3) ? {
    files: faker.helpers.multiple(() => ({
      name: faker.system.fileName(),
      size: faker.number.int({ min: 1024, max: 5242880 }), // 1KB - 5MB
      type: faker.helpers.arrayElement(['image/png', 'image/jpeg', 'application/pdf', 'text/plain', 'application/zip']),
      uploadedAt: faker.date.between({ from: createdAt, to: now })
    }), { count: { min: 1, max: 3 } })
  } : null;

  tasks.push({
    title: taskContent.title,
    description: taskContent.description,
    status: status,
    priority: priority,
    deadline: deadline,
    assigneeIds: assignees.map(a => a.id),
    creatorId: creator.id,
    attachments: attachments,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: now })
  });
}

export { tasks };
