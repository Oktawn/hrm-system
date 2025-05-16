import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { LeaveTypeEnum, RequestsStatusEnum } from "../commons/enums/enums";

@Entity("leaves")
export class LeavesEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @ManyToOne(() => EmployeesEntity, employee => employee.leaves)
  employee: EmployeesEntity;

  @Column({ type: "enum", enum: LeaveTypeEnum })
  type: LeaveTypeEnum;

  @Column({ type: "date" })
  startDate: Date;

  @Column({ type: "date" })
  endDate: Date;

  @Column({ type: "enum", enum: RequestsStatusEnum, default: RequestsStatusEnum.PENDING })
  status: RequestsStatusEnum;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true })
  comments: string;

  @ManyToOne(() => EmployeesEntity, { nullable: true })
  approvedBy: EmployeesEntity;

  @Column({ nullable: true, type: "date" })
  approvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}