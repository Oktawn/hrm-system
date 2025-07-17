import { employees, employeeRoles } from './employees-mocks';
import { UserRoleEnum } from '../../commons/enums/enums';
import * as bcrypt from 'bcrypt';

const users = employees.map(e => ({
  id: e.userId,
  email: `${e.firstName.toLowerCase()}.${e.lastName.toLowerCase()}@hrm.com`,
  password: bcrypt.hashSync('password123', 10),
  role: employeeRoles.get(e.userId) || UserRoleEnum.EMPLOYEE,
  isActive: true
}));

export { users };
