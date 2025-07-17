import { faker } from '@faker-js/faker';
import { employees, employeeRoles } from './employees-mocks';
import { RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum, UserRoleEnum } from '../../commons/enums/enums';

const REQUEST_COUNT = 100;
const requests = [];
const now = new Date();
const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

// Функция для выбора исполнителя заявки
const getAssigneeForRequest = (type: RequestTypeEnum, creatorDepartmentId: number) => {
  // Получаем HR сотрудников из того же отдела
  const hrInDepartment = employees.filter(emp => 
    emp.departmentId === creatorDepartmentId && 
    employeeRoles.get(emp.userId) === UserRoleEnum.HR
  );
  
  // Получаем руководителей из того же отдела
  const headsInDepartment = employees.filter(emp => 
    emp.departmentId === creatorDepartmentId && 
    employeeRoles.get(emp.userId) === UserRoleEnum.HEAD
  );
  
  // Получаем всех HR и руководителей
  const allHR = employees.filter(emp => employeeRoles.get(emp.userId) === UserRoleEnum.HR);
  const allHeads = employees.filter(emp => employeeRoles.get(emp.userId) === UserRoleEnum.HEAD);
  
  switch (type) {
    case RequestTypeEnum.DOCUMENT:
    case RequestTypeEnum.CERTIFICATE:
      // Для документов и справок - преимущественно HR
      if (hrInDepartment.length > 0) {
        return faker.helpers.arrayElement(hrInDepartment);
      }
      if (allHR.length > 0) {
        return faker.helpers.arrayElement(allHR);
      }
      break;
      
    case RequestTypeEnum.LEAVE_VACATION:
    case RequestTypeEnum.LEAVE_SICK:
    case RequestTypeEnum.LEAVE_PERSONAL:
      // Для отпусков - руководители отделов
      if (headsInDepartment.length > 0) {
        return faker.helpers.arrayElement(headsInDepartment);
      }
      if (allHeads.length > 0) {
        return faker.helpers.arrayElement(allHeads);
      }
      break;
      
    case RequestTypeEnum.BUSINESS_TRIP:
    case RequestTypeEnum.REMOTE_WORK:
      // Для командировок и удаленки - руководители
      if (headsInDepartment.length > 0) {
        return faker.helpers.arrayElement(headsInDepartment);
      }
      if (allHeads.length > 0) {
        return faker.helpers.arrayElement(allHeads);
      }
      break;
      
    case RequestTypeEnum.EQUIPMENT:
      // Для оборудования - может быть HR или руководитель
      const possibleAssignees = [...hrInDepartment, ...headsInDepartment];
      if (possibleAssignees.length > 0) {
        return faker.helpers.arrayElement(possibleAssignees);
      }
      break;
      
    default:
      // Для остальных случаев - случайный выбор между HR и руководителями
      const allPossible = [...hrInDepartment, ...headsInDepartment];
      if (allPossible.length > 0) {
        return faker.helpers.arrayElement(allPossible);
      }
      break;
  }
  
  // Если не нашли подходящего исполнителя, возвращаем случайного HR или руководителя
  const fallbackAssignees = [...allHR, ...allHeads];
  return fallbackAssignees.length > 0 ? faker.helpers.arrayElement(fallbackAssignees) : null;
};

const generateRequestContent = (type: RequestTypeEnum) => {
  switch (type) {
    case RequestTypeEnum.DOCUMENT:
      return {
        title: faker.helpers.arrayElement([
          'Запрос справки с места работы',
          'Необходима справка о трудоустройстве',
          'Запрос выписки из личного дела',
          'Копия трудового договора'
        ]),
        description: faker.helpers.arrayElement([
          'Справка необходима для предоставления в банк при оформлении кредита',
          'Требуется для оформления визы в посольстве',
          'Необходимо для государственных органов',
          'Справка нужна для медицинского учреждения'
        ])
      };

    case RequestTypeEnum.CERTIFICATE:
      return {
        title: faker.helpers.arrayElement([
          'Справка о доходах',
          'Справка об отпуске',
          'Медицинская справка'
        ]),
        description: faker.helpers.arrayElement([
          'Справка о доходах за последние 6 месяцев для банка',
          'Информация об использованных и оставшихся днях отпуска',
          'Медицинская справка для профосмотра'
        ])
      };

    case RequestTypeEnum.LEAVE_VACATION:
      return {
        title: faker.helpers.arrayElement([
          'Заявление на отпуск',
          'Запрос на очередной отпуск',
          'Планирование отпуска'
        ]),
        description: `Прошу предоставить отпуск с ${faker.date.future().toLocaleDateString('ru-RU')} на ${faker.number.int({ min: 14, max: 28 })} дней`
      };

    case RequestTypeEnum.LEAVE_SICK:
      return {
        title: faker.helpers.arrayElement([
          'Больничный лист',
          'Временная нетрудоспособность',
          'Медицинский отпуск'
        ]),
        description: faker.helpers.arrayElement([
          'Больничный лист по причине заболевания',
          'Временная нетрудоспособность по рекомендации врача',
          'Медицинский отпуск для лечения'
        ])
      };

    case RequestTypeEnum.LEAVE_PERSONAL:
      return {
        title: faker.helpers.arrayElement([
          'Заявление на отгул',
          'Запрос дня без сохранения зарплаты',
          'Личный отгул'
        ]),
        description: faker.helpers.arrayElement([
          'Прошу предоставить отгул по семейным обстоятельствам',
          'Необходим день для решения личных вопросов',
          'Отгул по личным обстоятельствам'
        ])
      };

    case RequestTypeEnum.BUSINESS_TRIP:
      return {
        title: faker.helpers.arrayElement([
          'Служебная командировка',
          'Рабочая поездка',
          'Командировка к клиенту'
        ]),
        description: faker.helpers.arrayElement([
          'Командировка в региональный офис для обучения персонала',
          'Рабочая поездка к клиенту для решения технических вопросов',
          'Участие в конференции в другом городе'
        ])
      };

    case RequestTypeEnum.REMOTE_WORK:
      return {
        title: faker.helpers.arrayElement([
          'Запрос на удаленную работу',
          'Работа из дома',
          'Удаленный режим работы'
        ]),
        description: faker.helpers.arrayElement([
          'Прошу разрешить работу из дома по семейным обстоятельствам',
          'Необходимо работать удаленно в связи с переездом',
          'Временная работа из дома по состоянию здоровья'
        ])
      };

    case RequestTypeEnum.EQUIPMENT:
      return {
        title: faker.helpers.arrayElement([
          'Запрос оборудования',
          'Необходимо рабочее оборудование',
          'Заявка на IT-оборудование'
        ]),
        description: faker.helpers.arrayElement([
          'Необходим новый ноутбук для работы',
          'Требуется дополнительный монитор',
          'Заявка на замену клавиатуры и мыши'
        ])
      };

    default:
      return {
        title: faker.helpers.arrayElement([
          'Общий запрос',
          'Различные вопросы',
          'Прочие вопросы'
        ]),
        description: faker.lorem.paragraph()
      };
  }
};

for (let i = 0; i < REQUEST_COUNT; i++) {
  const author = employees[faker.number.int({ min: 0, max: employees.length - 1 })];
  const createdAt = faker.date.between({ from: twoYearsAgo, to: now });
  const status = faker.helpers.arrayElement(Object.values(RequestStatusEnum));

  const type = faker.helpers.arrayElement(Object.values(RequestTypeEnum));
  const content = generateRequestContent(type);
  
  // Получаем исполнителя для заявки
  const assignee = getAssigneeForRequest(type, author.departmentId);

  // Генерируем даты для заявок на отпуск, больничный и командировки
  let startDate = null;
  let endDate = null;
  let duration = null;

  if (type === RequestTypeEnum.LEAVE_VACATION || 
      type === RequestTypeEnum.LEAVE_SICK || 
      type === RequestTypeEnum.LEAVE_PERSONAL ||
      type === RequestTypeEnum.BUSINESS_TRIP) {
    
    startDate = faker.date.between({ 
      from: createdAt, 
      to: new Date(createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // + 30 дней
    });
    
    const durationDays = faker.number.int({ 
      min: type === RequestTypeEnum.LEAVE_PERSONAL ? 1 : 5, 
      max: type === RequestTypeEnum.LEAVE_VACATION ? 28 : 14 
    });
    
    duration = durationDays;
    endDate = new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000);
  }

  requests.push({
    type: type,
    priority: faker.helpers.arrayElement(Object.values(TaskPriorityEnum)),
    title: content.title,
    description: content.description,
    createdAt,
    status,
    creatorId: author.id,
    assigneeId: assignee ? assignee.id : null,
    startDate,
    endDate,
    duration,
    attachments: null
  });
}

export { requests };
