import { faker } from '@faker-js/faker';
import { UserRoleEnum } from '../../commons/enums/enums';
import { departments } from './departments-mocks';
import { positions } from './positions-mocks';
import { getRoleByPositionName } from '../../utils/role.utils';
const EMPLOYEE_COUNT = 200;

const employees = [];

const employeeRoles = new Map();

const adminId = faker.string.uuid();
const adminPosition = positions.find(p => p.name.includes('CTO')) || positions[0];
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
  departmentId: adminPosition.departmentId,
  positionId: adminPosition.id
});
employeeRoles.set(adminId, UserRoleEnum.ADMIN);

for (let depIdx = 0; depIdx < departments.length; depIdx++) {
  const department = departments[depIdx];
  const departmentPositions = positions.filter(p => p.departmentId === department.id);

  const keyPositions = [
    departmentPositions.find(p => p.name.toLowerCase().includes('директор')),
    departmentPositions.find(p => p.name.toLowerCase().includes('руководитель')),
    departmentPositions.find(p => p.name.toLowerCase().includes('hr') && !p.name.toLowerCase().includes('директор')),
    departmentPositions.find(p => (p.name.toLowerCase().includes('менеджер') || p.name.toLowerCase().includes('manager')) &&
      !p.name.toLowerCase().includes('директор')),
    ...faker.helpers.arrayElements(departmentPositions.filter(p =>
      !p.name.toLowerCase().includes('директор') &&
      !p.name.toLowerCase().includes('руководитель')
    ), { min: 2, max: 4 })
  ].filter(Boolean);

  keyPositions.forEach(position => {
    if (position && employees.length < EMPLOYEE_COUNT) {
      const employeeUserId = faker.string.uuid();
      const role = getRoleByPositionName(position.name);

      employees.push({
        id: faker.string.uuid(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        middleName: faker.person.middleName(),
        birthDate: faker.date.birthdate({
          min: role === UserRoleEnum.HEAD ? 30 : (role === UserRoleEnum.MANAGER ? 25 : 22),
          max: role === UserRoleEnum.HEAD ? 55 : (role === UserRoleEnum.MANAGER ? 45 : 40),
          mode: 'age'
        }),
        hireDate: faker.date.past({
          years: role === UserRoleEnum.HEAD ? 6 : (role === UserRoleEnum.MANAGER ? 4 : 3)
        }),
        phone: faker.phone.number({ style: 'international' }),
        userId: employeeUserId,
        tgID: faker.number.int({ min: 100000000, max: 999999999 }),
        tgUsername: `@${faker.internet.username()}`,
        departmentId: department.id,
        positionId: position.id
      });
      employeeRoles.set(employeeUserId, role);
    }
  });
}

while (employees.length < EMPLOYEE_COUNT) {
  const depIdx = faker.number.int({ min: 0, max: departments.length - 1 });
  const department = departments[depIdx];
  const departmentPositions = positions.filter(p => p.departmentId === department.id);

  const position = faker.helpers.arrayElement(departmentPositions);
  const employeeUserId = faker.string.uuid();
  const role = getRoleByPositionName(position.name);

  employees.push({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    middleName: faker.person.middleName(),
    birthDate: faker.date.birthdate({
      min: role === UserRoleEnum.HEAD ? 30 : (role === UserRoleEnum.MANAGER ? 25 : 22),
      max: role === UserRoleEnum.HEAD ? 55 : (role === UserRoleEnum.MANAGER ? 45 : 40),
      mode: 'age'
    }),
    hireDate: faker.date.past({
      years: role === UserRoleEnum.HEAD ? 6 : (role === UserRoleEnum.MANAGER ? 4 : 2)
    }),
    phone: faker.phone.number({ style: 'international' }),
    userId: employeeUserId,
    tgID: faker.number.int({ min: 100000000, max: 999999999 }),
    tgUsername: `@${faker.internet.username()}`,
    departmentId: department.id,
    positionId: position.id
  });
  employeeRoles.set(employeeUserId, role);
}

export { employees, employeeRoles };
