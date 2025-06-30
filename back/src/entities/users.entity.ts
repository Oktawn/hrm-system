import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { UserRoleEnum } from "../commons/enums/enums";
import { RefreshTokenEntity } from "./refresh-tokens.entity";

@Entity("users")
export class UsersEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true, nullable: true })
  tgID: number;

  @Column()
  password: string;

  @Column({ type: "enum", enum: UserRoleEnum, default: UserRoleEnum.EMPLOYEE })
  role: UserRoleEnum;

  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => EmployeesEntity, employee => employee.user)
  employee: EmployeesEntity;

  @OneToOne(() => RefreshTokenEntity, refreshToken => refreshToken.user)
  refreshToken: RefreshTokenEntity;


}