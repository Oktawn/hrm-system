import { AppDataSource } from "../data-source";
import { DepartmentsEntity } from "../entities/departments.entity";
import { EmployeesEntity } from "../entities/employees.entity";
import { PositionsEntity } from "../entities/positions.entity";
import { RefreshTokenEntity } from "../entities/refresh-tokens.entity";
import { RequestEntity } from "../entities/request.entity";
import { TasksEntity } from "../entities/tasks.entity";
import { UsersEntity } from "../entities/users.entity";
import { CommentsEntity } from "../entities/comments.entity";
import { DocumentEntity } from "../entities/documents.entity";

const userRepository = AppDataSource.getRepository(UsersEntity);
const refreshTokenRepository = AppDataSource.getRepository(RefreshTokenEntity);
const employeeRepository = AppDataSource.getRepository(EmployeesEntity);
const departmentRepository = AppDataSource.getRepository(DepartmentsEntity);
const positionRepository = AppDataSource.getRepository(PositionsEntity);
const taskRepository = AppDataSource.getRepository(TasksEntity);
const requestRepository = AppDataSource.getRepository(RequestEntity);
const commentRepository = AppDataSource.getRepository(CommentsEntity);
const documentRepository = AppDataSource.getRepository(DocumentEntity);


export {
  userRepository,
  refreshTokenRepository,
  employeeRepository,
  departmentRepository,
  positionRepository,
  taskRepository,
  requestRepository,
  commentRepository,
  documentRepository
};