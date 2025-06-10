import { Knex } from "knex";
import { UserRoleEnum } from "../commons/enums/enums";
import * as bcrypt from "bcrypt";
import { faker } from '@faker-js/faker';

export async function seed(knex: Knex): Promise<void> {
    // Очищаем таблицы в правильном порядке (учитывая зависимости)
    await knex("tasks_assignees_employees").del();
    await knex("requests").del();
    await knex("tasks").del();
    await knex("employees").del();
    await knex("positions").del();
    await knex("departments").del();
    await knex("refresh_tokens").del();
    await knex("users").del();

    console.log("Generating 40 users and employees...");

    await knex("departments").insert([
        { id: 1, name: "Информационные технологии" },
        { id: 2, name: "Отдел кадров" },
        { id: 3, name: "Финансовый отдел" },
        { id: 4, name: "Маркетинг" },
        { id: 5, name: "Продажи" },
        { id: 6, name: "Операционный отдел" }
    ]);

    await knex("positions").insert([
        { id: 1, name: "Руководитель IT отдела", baseSalary: 150000.00, grade: "Senior", departmentId: 1 },
        { id: 2, name: "Старший разработчик", baseSalary: 120000.00, grade: "Senior", departmentId: 1 },
        { id: 3, name: "Frontend разработчик", baseSalary: 90000.00, grade: "Middle", departmentId: 1 },
        { id: 4, name: "Backend разработчик", baseSalary: 95000.00, grade: "Middle", departmentId: 1 },
        { id: 5, name: "DevOps инженер", baseSalary: 110000.00, grade: "Middle", departmentId: 1 },
        { id: 6, name: "HR директор", baseSalary: 140000.00, grade: "Senior", departmentId: 2 },
        { id: 7, name: "HR менеджер", baseSalary: 80000.00, grade: "Middle", departmentId: 2 },
        { id: 8, name: "HR специалист", baseSalary: 60000.00, grade: "Junior", departmentId: 2 },
        { id: 9, name: "Финансовый директор", baseSalary: 160000.00, grade: "Senior", departmentId: 3 },
        { id: 10, name: "Бухгалтер", baseSalary: 70000.00, departmentId: 3 },
        { id: 11, name: "Маркетинг менеджер", baseSalary: 85000.00, grade: "Middle", departmentId: 4 },
        { id: 12, name: "SMM специалист", baseSalary: 55000.00, grade: "Junior", departmentId: 4 },
        { id: 13, name: "Менеджер по продажам", baseSalary: 75000.00, grade: "Middle", departmentId: 5 },
        { id: 14, name: "Старший менеджер по продажам", baseSalary: 100000.00, grade: "Senior", departmentId: 5 },
        { id: 15, name: "Операционный менеджер", baseSalary: 90000.00, departmentId: 6 }
    ]);

    const users = [];
    const employees = [];

    const adminId = faker.string.uuid();
    users.push({
        id: adminId,
        email: "admin@hrm.com",
        password: bcrypt.hashSync("admin123", 10),
        role: UserRoleEnum.ADMIN,
    });
    employees.push({
        id: faker.string.uuid(),
        firstName: "Иван",
        lastName: "Петров",
        middleName: "Сергеевич",
        birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
        hireDate: faker.date.past({ years: 5 }),
        phone: faker.phone.number({ style: 'international' }),
        userId: adminId,
        departmentId: 1, // IT
        positionId: 1 // Руководитель IT отдела
    });

    for (let i = 0; i < 3; i++) {
        const userId = faker.string.uuid();
        users.push({
            id: userId,
            email: `hr${i + 1}@hrm.com`,
            password: bcrypt.hashSync("password123", 10),
            role: UserRoleEnum.HR,
            isActive: true
        });
        employees.push({
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
            birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
            hireDate: faker.date.past({ years: 3 }),
            phone: faker.phone.number({ style: 'international' }),
            userId: userId,
            departmentId: 2, // HR
            positionId: i === 0 ? 6 : (i === 1 ? 7 : 8) // HR директор, менеджер, специалист
        });
    }

    for (let i = 0; i < 6; i++) {
        const userId = faker.string.uuid();
        users.push({
            id: userId,
            email: `manager${i + 1}@hrm.com`,
            password: bcrypt.hashSync("password123", 10),
            role: UserRoleEnum.MANAGER,
            isActive: i < 5
        });

        const departmentId = (i % 5) + 2;
        let positionId;
        switch (departmentId) {
            case 2: positionId = 7; break; // HR менеджер
            case 3: positionId = 9; break; // Финансовый директор
            case 4: positionId = 11; break; // Маркетинг менеджер
            case 5: positionId = 14; break; // Старший менеджер по продажам
            case 6: positionId = 15; break; // Операционный менеджер
            default: positionId = 13; // Менеджер по продажам
        }

        employees.push({
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
            birthDate: faker.date.birthdate({ min: 28, max: 50, mode: 'age' }),
            hireDate: faker.date.past({ years: 4 }),
            phone: faker.phone.number({ style: 'international' }),
            userId: userId,
            departmentId: departmentId,
            positionId: positionId
        });
    }

    for (let i = 0; i < 30; i++) {
        const userId = faker.string.uuid();
        users.push({
            id: userId,
            email: faker.internet.email().toLowerCase(),
            password: bcrypt.hashSync("password123", 10),
            role: UserRoleEnum.EMPLOYEE,
            isActive: i < 26
        });

        const departmentId = (i % 6) + 1;
        let positionId;
        switch (departmentId) {
            case 1: // IT
                positionId = [2, 3, 4, 5][i % 4];
                break;
            case 2: // HR
                positionId = 8; // HR специалист
                break;
            case 3: // Финансы
                positionId = 10; // Бухгалтер
                break;
            case 4: // Маркетинг
                positionId = 12; // SMM специалист
                break;
            case 5: // Продажи
                positionId = 13; // Менеджер по продажам
                break;
            case 6: // Операционный
                positionId = 15; // Операционный менеджер
                break;
            default:
                positionId = 13;
        }

        employees.push({
            id: faker.string.uuid(),
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            middleName: faker.person.middleName(),
            birthDate: faker.date.birthdate({ min: 22, max: 40, mode: 'age' }),
            hireDate: faker.date.past({ years: 3 }),
            phone: faker.phone.number({ style: 'international' }),
            userId: userId,
            departmentId: departmentId,
            positionId: positionId
        });
    }

    await knex("users").insert(users).returning('*');

    await knex("employees").insert(employees).returning('*');

    const hrAndManagers = employees.filter((emp, index) => {
        const user = users[index];
        return user.role === UserRoleEnum.HR || user.role === UserRoleEnum.MANAGER || user.role === UserRoleEnum.ADMIN;
    });

    for (let i = 0; i < employees.length; i++) {
        const employee = employees[i];
        const user = users[i];

        if (user.role === UserRoleEnum.EMPLOYEE) {
            const randomManager = hrAndManagers[Math.floor(Math.random() * hrAndManagers.length)];

            await knex("employees")
                .where({ id: employee.id })
                .update({ assignedManagerId: randomManager.id });
        }
    }

};
