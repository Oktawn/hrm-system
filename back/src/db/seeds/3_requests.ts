import { RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum } from "../../commons/enums/enums";
import { faker } from '@faker-js/faker';

export async function seed(knex: import("knex").Knex): Promise<void> {
    await knex("requests").del();

    const employees = await knex("employees").select("*");

    const hrEmployees = await knex("employees")
        .join("users", "employees.userId", "users.id")
        .where("users.role", "hr")
        .select("employees.*");

    const managers = await knex("employees")
        .join("users", "employees.userId", "users.id")
        .where("users.role", "IN", ["admin", "manager"])
        .select("employees.*");

    if (employees.length === 0) {
        return;
    }

    const assignees = [...hrEmployees, ...managers];

    const requests = [];

    const requestTitles = {
        [RequestTypeEnum.LEAVE_VACATION]: [
            "Отпуск на 14 дней", "Летний отпуск", "Отпуск по семейным обстоятельствам",
            "Плановый отпуск", "Дополнительный отпуск"
        ],
        [RequestTypeEnum.LEAVE_SICK]: [
            "Больничный лист", "Лечение", "Больничный по уходу за ребенком",
            "Медицинская процедура", "Восстановление после болезни"
        ],
        [RequestTypeEnum.LEAVE_PERSONAL]: [
            "Отгул на 1 день", "Личные дела", "Семейные обстоятельства",
            "Административный отгул", "День без содержания"
        ],
        [RequestTypeEnum.DOCUMENT]: [
            "Справка о доходах", "Трудовая книжка", "Справка с места работы",
            "Копия трудового договора", "Справка для банка"
        ],
        [RequestTypeEnum.CERTIFICATE]: [
            "Справка с места работы", "Справка для визы", "Справка для суда",
            "Справка в налоговую", "Справка для соцзащиты"
        ]
    };

    const requestDescriptions = {
        [RequestTypeEnum.LEAVE_VACATION]: [
            "Прошу предоставить отпуск для отдыха с семьей",
            "Планирую поездку за границу",
            "Необходим отдых для восстановления сил",
            "Семейные обстоятельства требуют отпуска"
        ],
        [RequestTypeEnum.LEAVE_SICK]: [
            "Прикладываю больничный лист",
            "Требуется лечение в стационаре",
            "Необходимо время на восстановление",
            "Медицинские показания"
        ],
        [RequestTypeEnum.LEAVE_PERSONAL]: [
            "Личные дела требуют решения",
            "Семейные обстоятельства",
            "Необходимо решить административные вопросы",
            "Неотложные личные дела"
        ],
        [RequestTypeEnum.DOCUMENT]: [
            "Требуется для банка",
            "Необходимо для оформления кредита",
            "Для предоставления в другую организацию",
            "Для личного архива"
        ],
        [RequestTypeEnum.CERTIFICATE]: [
            "Требуется для оформления визы",
            "Необходимо для суда",
            "Для предоставления в госорганы",
            "Для социальных выплат"
        ]
    };

    for (let i = 0; i < 35; i++) {
        const creator = employees[Math.floor(Math.random() * employees.length)];
        const requestType = Object.values(RequestTypeEnum)[Math.floor(Math.random() * Object.values(RequestTypeEnum).length)];
        const titles = requestTitles[requestType];
        const descriptions = requestDescriptions[requestType];
        if (!titles || !descriptions) {
            continue;
        }
        const title = titles[Math.floor(Math.random() * titles.length)];
        const description = descriptions[Math.floor(Math.random() * descriptions.length)];

        let assignee;
        if ([RequestTypeEnum.DOCUMENT, RequestTypeEnum.CERTIFICATE].includes(requestType)) {
            assignee = hrEmployees.length > 0 ? hrEmployees[Math.floor(Math.random() * hrEmployees.length)] : null;
        } else {
            assignee = assignees.length > 0 ? assignees[Math.floor(Math.random() * assignees.length)] : null;
        }

        let startDate = null;
        let endDate = null;
        let duration = null;

        if ([RequestTypeEnum.LEAVE_VACATION, RequestTypeEnum.LEAVE_SICK, RequestTypeEnum.LEAVE_PERSONAL].includes(requestType)) {
            startDate = faker.date.future({ years: 0.5 });

            if (requestType === RequestTypeEnum.LEAVE_VACATION) {
                duration = Math.floor(Math.random() * 21) + 7; // 7-28 дней
            } else if (requestType === RequestTypeEnum.LEAVE_SICK) {
                duration = Math.floor(Math.random() * 10) + 1; // 1-10 дней
            } else {
                duration = Math.floor(Math.random() * 3) + 1; // 1-3 дня
            }

            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + duration - 1);
        }

        requests.push({
            type: requestType,
            priority: Object.values(TaskPriorityEnum)[Math.floor(Math.random() * Object.values(TaskPriorityEnum).length)],
            status: Object.values(RequestStatusEnum)[Math.floor(Math.random() * Object.values(RequestStatusEnum).length)],
            title: title,
            description: description,
            creatorId: creator.id,
            assigneeId: assignee ? assignee.id : null,
            startDate: startDate,
            endDate: endDate,
            duration: duration,
            attachments: Math.random() > 0.8 ? JSON.stringify([
                { name: `${requestType}_document.pdf`, url: `/files/${requestType}_document.pdf` }
            ]) : null
        });
    }

    await knex("requests").insert(requests);

};
