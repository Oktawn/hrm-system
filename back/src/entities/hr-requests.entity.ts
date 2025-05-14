import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { RequestsStatusEnum, RequestTypeEnum } from "../commons/enums/enums";


@Entity("hr_requests")
export class HrRequestsEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => EmployeesEntity, employee => employee.hrRequests)
  employee: EmployeesEntity;

  @Column({ type: "enum", enum: RequestTypeEnum })
  type: RequestTypeEnum;

  @Column()
  subject: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: RequestsStatusEnum, default: RequestsStatusEnum.PENDING })
  status: RequestsStatusEnum;

  @ManyToOne(() => EmployeesEntity, { nullable: true })
  assignedTo: EmployeesEntity;

  @Column({ nullable: true, type: "date" })
  completionDate: Date;

  @Column({ nullable: true })
  resolution: string;

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}