import { AppDataSource } from "../data-source";
import { EmployeesEntity } from "../entities/employees.entity";
import { RefreshTokenEntity } from "../entities/refresh-tokens.entity";
import { UsersEntity } from "../entities/users.entity";

const userRepository = AppDataSource.getRepository(UsersEntity);
const refreshTokenRepository = AppDataSource.getRepository(RefreshTokenEntity);
const employeeRepository = AppDataSource.getRepository(EmployeesEntity);

export {
  userRepository,
  refreshTokenRepository,
  employeeRepository
}