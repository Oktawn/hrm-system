import { employees, employeeRoles } from './employees-mocks';
import { UserRoleEnum } from '../../commons/enums/enums';

const assignments = [];

const managersByDepartment = {};
const hrByDepartment = {};

employees.forEach(e => {
  const role = employeeRoles.get(e.userId);
  
  if (role === UserRoleEnum.HR || role === UserRoleEnum.MANAGER || role === UserRoleEnum.HEAD) {
    if (!managersByDepartment[e.departmentId]) {
      managersByDepartment[e.departmentId] = [];
    }
    managersByDepartment[e.departmentId].push(e.id);
    
    if (role === UserRoleEnum.HR) {
      hrByDepartment[e.departmentId] = e.id;
    }
  }
});

employees.forEach(e => {
  const role = employeeRoles.get(e.userId);
  
  if (role === UserRoleEnum.EMPLOYEE) {
    let assignedManagerId = null;
    
    if (hrByDepartment[e.departmentId]) {
      assignedManagerId = hrByDepartment[e.departmentId];
    } else if (managersByDepartment[e.departmentId] && managersByDepartment[e.departmentId].length > 0) {
      assignedManagerId = managersByDepartment[e.departmentId][0];
    }
    
    if (assignedManagerId) {
      assignments.push({
        employeeId: e.id,
        assignedManagerId: assignedManagerId
      });
    }
  }
});

export { assignments };
