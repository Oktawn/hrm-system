import { employees, employeeRoles } from './employees-mocks';
import { UserRoleEnum } from '../../commons/enums/enums';

// Назначения: HR -> сотрудники, менеджеры -> отделы, руководители -> отделы
const assignments = [];

const hrByDepartment = {};
employees.forEach(e => {
  if (employeeRoles.get(e.userId) === UserRoleEnum.HR) {
    hrByDepartment[e.departmentId] = e.id;
  }
});

employees.forEach(e => {
  if (employeeRoles.get(e.userId) === UserRoleEnum.EMPLOYEE) {
    assignments.push({
      employeeId: e.id,
      assignedManagerId: hrByDepartment[e.departmentId]
    });
  }
});

export { assignments };
