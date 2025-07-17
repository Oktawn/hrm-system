import { faker } from '@faker-js/faker';
import { UserRoleEnum } from '../../commons/enums/enums';
import { departments } from './departments-mocks';
import { positions } from './positions-mocks';
const EMPLOYEE_COUNT = 200;

const employees = [];

// Храним роли для каждого сотрудника отдельно для использования в users-mocks
const employeeRoles = new Map();

// Админ
const adminId = faker.string.uuid();
employees.push({
  id: faker.string.uuid(),
  firstName: 'Иван',
  lastName: 'Петров',
  middleName: 'Сергеевич',
  birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
  hireDate: faker.date.past({ years: 5 }),
  phone: faker.phone.number({ style: 'international' }),
  userId: adminId,
  tgID: faker.number.int({ min: 100000000, max: 999999999 }),
  tgUsername: `@${faker.internet.username()}`,
  departmentId: 1,
  positionId: 1
});
employeeRoles.set(adminId, UserRoleEnum.ADMIN);

for (let depIdx = 0; depIdx < departments.length; depIdx++) {
  const department = departments[depIdx];
  // HR — один на отдел
  const hrUserId = faker.string.uuid();
  employees.push({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    birthDate: faker.date.birthdate({ min: 25, max: 45, mode: 'age' }),
    hireDate: faker.date.past({ years: 3 }),
    phone: faker.phone.number({ style: 'international' }),
    userId: hrUserId,
    tgID: faker.number.int({ min: 100000000, max: 999999999 }),
    tgUsername: `@${faker.internet.username()}`,
    departmentId: department.id,
    positionId: positions.find(p => p.departmentId === department.id && p.name.toLowerCase().includes('hr'))?.id || positions[0].id
  });
  employeeRoles.set(hrUserId, UserRoleEnum.HR);
}

// Менеджеры — один на три отдела (распределяем по группам)
const managerGroups = Math.ceil(departments.length / 3);
for (let group = 0; group < managerGroups; group++) {
  // Менеджер для группы из 3 отделов
  const groupDepartments = departments.slice(group * 3, (group + 1) * 3);
  const managerUserId = faker.string.uuid();
  employees.push({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    birthDate: faker.date.birthdate({ min: 28, max: 50, mode: 'age' }),
    hireDate: faker.date.past({ years: 4 }),
    phone: faker.phone.number({ style: 'international' }),
    userId: managerUserId,
    tgID: faker.number.int({ min: 100000000, max: 999999999 }),
    tgUsername: `@${faker.internet.username()}`,
    departmentId: groupDepartments[0].id, // Привязываем к первому отделу группы
    positionId: positions.find(p => p.departmentId === groupDepartments[0].id && p.name.toLowerCase().includes('менеджер'))?.id || positions[0].id
  });
  employeeRoles.set(managerUserId, UserRoleEnum.MANAGER);
}

// Руководитель — один на отдел
for (let depIdx = 0; depIdx < departments.length; depIdx++) {
  const department = departments[depIdx];
  const headUserId = faker.string.uuid();
  employees.push({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    birthDate: faker.date.birthdate({ min: 30, max: 55, mode: 'age' }),
    hireDate: faker.date.past({ years: 6 }),
    phone: faker.phone.number({ style: 'international' }),
    userId: headUserId,
    tgID: faker.number.int({ min: 100000000, max: 999999999 }),
    tgUsername: `@${faker.internet.username()}`,
    departmentId: department.id,
    positionId: positions.find(p => p.departmentId === department.id && (p.name.toLowerCase().includes('руководитель') || p.name.toLowerCase().includes('директор')))?.id || positions[0].id
  });
  employeeRoles.set(headUserId, UserRoleEnum.HEAD);
}

// Остальные сотрудники
while (employees.length < EMPLOYEE_COUNT) {
  const depIdx = faker.number.int({ min: 0, max: departments.length - 1 });
  const department = departments[depIdx];
  const employeeUserId = faker.string.uuid();
  employees.push({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    birthDate: faker.date.birthdate({ min: 22, max: 40, mode: 'age' }),
    hireDate: faker.date.past({ years: 2 }),
    phone: faker.phone.number({ style: 'international' }),
    userId: employeeUserId,
    tgID: faker.number.int({ min: 100000000, max: 999999999 }),
    tgUsername: `@${faker.internet.username()}`,
    departmentId: department.id,
    positionId: positions.find(p => p.departmentId === department.id && !['hr', 'менеджер', 'руководитель', 'директор'].some(role => p.name.toLowerCase().includes(role)))?.id || positions[0].id
  });
  employeeRoles.set(employeeUserId, UserRoleEnum.EMPLOYEE);
}

export { employees, employeeRoles };
