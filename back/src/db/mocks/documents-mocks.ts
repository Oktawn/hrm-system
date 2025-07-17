import { faker } from '@faker-js/faker';
import { DocumentStatusEnum, DocumentTypeEnum, RequestTypeEnum, UserRoleEnum } from '../../commons/enums/enums';
import { requests } from './requests-mocks';
import { employees, employeeRoles } from './employees-mocks';

// Фильтруем заявки - исключаем больничные (LEAVE_SICK)
const eligibleRequests = requests.filter(request =>
  request.type === RequestTypeEnum.DOCUMENT ||
  request.type === RequestTypeEnum.CERTIFICATE
);

// Создаем документы только для части заявок (примерно 70%)
const documentsToCreate = Math.floor(eligibleRequests.length * 0.7);
const selectedRequests = faker.helpers.shuffle(eligibleRequests).slice(0, documentsToCreate);

const documents = [];

// Получаем HR и админов для создания документов
const hrAndAdmins = employees.filter(emp => {
  const role = employeeRoles.get(emp.userId);
  return role === UserRoleEnum.HR || role === UserRoleEnum.ADMIN;
});

// Получаем руководителей для подписания документов
const heads = employees.filter(emp => {
  const role = employeeRoles.get(emp.userId);
  return role === UserRoleEnum.HEAD || role === UserRoleEnum.ADMIN;
});// Функция для генерации данных шаблона в зависимости от типа документа
const generateTemplateData = (type: DocumentTypeEnum, employee: any) => {
  const baseData = {
    employeeFullName: `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim(),
    employeePosition: 'Сотрудник', // Можно было бы связать с позицией
    department: 'Отдел', // Можно было бы связать с отделом
    hireDate: employee.hireDate,
    currentDate: new Date(),
  };

  switch (type) {
    case DocumentTypeEnum.WORK_CERTIFICATE:
      return {
        ...baseData,
        purpose: faker.helpers.arrayElement([
          'Для предоставления в банк',
          'Для оформления визы',
          'Для государственных органов',
          'Для медицинского учреждения'
        ]),
        workSchedule: '5-дневная рабочая неделя',
        workingHours: 'с 9:00 до 18:00'
      };

    case DocumentTypeEnum.SALARY_CERTIFICATE:
      return {
        ...baseData,
        averageSalary: faker.number.int({ min: 50000, max: 150000 }),
        period: 'последние 6 месяцев',
        currency: 'RUB'
      };

    case DocumentTypeEnum.EMPLOYMENT_CERTIFICATE:
      return {
        ...baseData,
        employmentType: 'Постоянная работа',
        workExperience: faker.number.int({ min: 1, max: 10 }) + ' лет'
      };

    case DocumentTypeEnum.VACATION_CERTIFICATE:
      return {
        ...baseData,
        vacationDays: faker.number.int({ min: 14, max: 28 }),
        vacationYear: new Date().getFullYear(),
        usedDays: faker.number.int({ min: 0, max: 14 }),
        remainingDays: faker.number.int({ min: 0, max: 28 })
      };

    case DocumentTypeEnum.PERSONAL_DATA_EXTRACT:
      return {
        ...baseData,
        personnelNumber: faker.string.alphanumeric(8).toUpperCase(),
        education: faker.helpers.arrayElement(['Высшее', 'Среднее специальное', 'Среднее']),
        maritalStatus: faker.helpers.arrayElement(['Женат/Замужем', 'Холост/Незамужем', 'Разведен/Разведена'])
      };

    case DocumentTypeEnum.CONTRACT_COPY:
      return {
        ...baseData,
        contractNumber: faker.string.alphanumeric(10).toUpperCase(),
        contractDate: employee.hireDate,
        contractType: 'Трудовой договор'
      };

    default:
      return baseData;
  }
};

// Функция для генерации содержимого документа
const generateDocumentContent = (type: DocumentTypeEnum, templateData: any) => {
  switch (type) {
    case DocumentTypeEnum.WORK_CERTIFICATE:
      return `СПРАВКА С МЕСТА РАБОТЫ

Выдана ${templateData.employeeFullName}, работающему в должности ${templateData.employeePosition} в ${templateData.department} с ${templateData.hireDate.toLocaleDateString('ru-RU')}.

Режим работы: ${templateData.workSchedule}, ${templateData.workingHours}.

Справка выдана для предоставления: ${templateData.purpose}.

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    case DocumentTypeEnum.SALARY_CERTIFICATE:
      return `СПРАВКА О ДОХОДАХ

Выдана ${templateData.employeeFullName}, работающему в должности ${templateData.employeePosition}.

Средняя заработная плата за ${templateData.period} составляет ${templateData.averageSalary.toLocaleString('ru-RU')} ${templateData.currency}.

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    case DocumentTypeEnum.EMPLOYMENT_CERTIFICATE:
      return `СПРАВКА О ТРУДОУСТРОЙСТВЕ

Подтверждаем, что ${templateData.employeeFullName} работает в нашей организации с ${templateData.hireDate.toLocaleDateString('ru-RU')} по настоящее время.

Тип трудоустройства: ${templateData.employmentType}
Общий стаж работы: ${templateData.workExperience}

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    case DocumentTypeEnum.VACATION_CERTIFICATE:
      return `СПРАВКА ОБ ОТПУСКЕ

Справка выдана ${templateData.employeeFullName} о предоставленном отпуске.

Общее количество дней отпуска за ${templateData.vacationYear} год: ${templateData.vacationDays}
Использовано дней: ${templateData.usedDays}
Остаток дней: ${templateData.remainingDays}

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    case DocumentTypeEnum.PERSONAL_DATA_EXTRACT:
      return `ВЫПИСКА ИЗ ЛИЧНОГО ДЕЛА

Сотрудник: ${templateData.employeeFullName}
Табельный номер: ${templateData.personnelNumber}
Дата приема на работу: ${templateData.hireDate.toLocaleDateString('ru-RU')}
Образование: ${templateData.education}
Семейное положение: ${templateData.maritalStatus}

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    case DocumentTypeEnum.CONTRACT_COPY:
      return `КОПИЯ ТРУДОВОГО ДОГОВОРА

Договор № ${templateData.contractNumber} от ${templateData.contractDate.toLocaleDateString('ru-RU')}

Сотрудник: ${templateData.employeeFullName}
Должность: ${templateData.employeePosition}
Тип договора: ${templateData.contractType}

Данная копия является верной копией оригинала.

Дата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;

    default:
      return `Документ для ${templateData.employeeFullName}\n\nДата выдачи: ${templateData.currentDate.toLocaleDateString('ru-RU')}`;
  }
};

// Создаем документы
for (let i = 0; i < selectedRequests.length; i++) {
  const request = selectedRequests[i];
  const requestAuthor = employees.find(emp => emp.id === request.authorId);

  if (!requestAuthor) continue;

  // Определяем тип документа на основе типа заявки
  let documentType: DocumentTypeEnum;
  if (request.type === RequestTypeEnum.DOCUMENT) {
    documentType = faker.helpers.arrayElement([
      DocumentTypeEnum.WORK_CERTIFICATE,
      DocumentTypeEnum.EMPLOYMENT_CERTIFICATE,
      DocumentTypeEnum.PERSONAL_DATA_EXTRACT,
      DocumentTypeEnum.CONTRACT_COPY
    ]);
  } else if (request.type === RequestTypeEnum.CERTIFICATE) {
    documentType = faker.helpers.arrayElement([
      DocumentTypeEnum.SALARY_CERTIFICATE,
      DocumentTypeEnum.VACATION_CERTIFICATE,
      DocumentTypeEnum.MEDICAL_CERTIFICATE
    ]);
  } else {
    documentType = DocumentTypeEnum.OTHER;
  }

  // Генерируем данные шаблона
  const templateData = generateTemplateData(documentType, requestAuthor);

  // Создатель документа (HR или админ)
  const createdBy = faker.helpers.arrayElement(hrAndAdmins);

  // Статус документа
  const status = faker.helpers.arrayElement(Object.values(DocumentStatusEnum));

  // Подписант (только для подписанных документов)
  let signedBy = null;
  let signedAt = null;
  if (status === DocumentStatusEnum.SIGNED) {
    signedBy = faker.helpers.arrayElement(heads);
    signedAt = faker.date.between({
      from: request.createdAt,
      to: new Date()
    });
  }

  // Причина отказа (только для отклоненных документов)
  let rejectionReason = null;
  if (status === DocumentStatusEnum.REJECTED) {
    rejectionReason = faker.helpers.arrayElement([
      'Недостаточно данных для формирования документа',
      'Документ не соответствует требованиям',
      'Отсутствуют необходимые согласования',
      'Неверно указана цель получения документа',
      'Требуется дополнительная информация'
    ]);
  }

  // Генерируем название документа
  const documentTitles = {
    [DocumentTypeEnum.WORK_CERTIFICATE]: 'Справка с места работы',
    [DocumentTypeEnum.SALARY_CERTIFICATE]: 'Справка о доходах',
    [DocumentTypeEnum.EMPLOYMENT_CERTIFICATE]: 'Справка о трудоустройстве',
    [DocumentTypeEnum.VACATION_CERTIFICATE]: 'Справка об отпуске',
    [DocumentTypeEnum.MEDICAL_CERTIFICATE]: 'Медицинская справка',
    [DocumentTypeEnum.PERSONAL_DATA_EXTRACT]: 'Выписка из личного дела',
    [DocumentTypeEnum.CONTRACT_COPY]: 'Копия трудового договора',
    [DocumentTypeEnum.OTHER]: 'Прочий документ'
  };

  // Создаем документ
  const document = {
    id: i + 1,
    type: documentType,
    title: documentTitles[documentType],
    description: `${documentTitles[documentType]} для ${requestAuthor.firstName} ${requestAuthor.lastName}`,
    status: status,
    content: generateDocumentContent(documentType, templateData),
    templatePath: `/templates/${documentType}.docx`,
    filePath: status === DocumentStatusEnum.SIGNED ? `/documents/${documentType}_${requestAuthor.id}_${Date.now()}.pdf` : null,
    fileUrl: status === DocumentStatusEnum.SIGNED ? `/api/documents/${i + 1}/download` : null,
    templateData: templateData,
    sourceRequestId: request.id,
    requestedById: requestAuthor.id,
    createdById: createdBy.id,
    signedById: signedBy?.id || null,
    signedAt: signedAt,
    rejectionReason: rejectionReason,
    metadata: {
      generatedAt: new Date(),
      documentVersion: '1.0',
      templateVersion: '2.1',
      autoGenerated: true,
      language: 'ru'
    },
    createdAt: faker.date.between({
      from: request.createdAt,
      to: new Date()
    }),
    updatedAt: faker.date.recent({ days: 30 })
  };

  documents.push(document);
}

export { documents };
