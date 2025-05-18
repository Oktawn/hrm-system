import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { RequestStatusEnum, RequestTypeEnum, TaskPriorityEnum } from "../commons/enums/enums";

@Entity("requests")
export class RequestEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "enum", enum: RequestTypeEnum })
  type: RequestTypeEnum;

  @Column({ type: "enum", enum: TaskPriorityEnum, default: TaskPriorityEnum.MEDIUM })
  priority: TaskPriorityEnum;

  @Column()
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "enum", enum: RequestStatusEnum, default: RequestStatusEnum.PENDING })
  status: RequestStatusEnum;

  @ManyToOne(() => EmployeesEntity)
  creator: EmployeesEntity;

  @ManyToMany(() => EmployeesEntity, { onDelete: "SET NULL" })
  @JoinTable()
  assignees: EmployeesEntity[];

  @Column({ type: "date", nullable: true })
  startDate: Date; // для отпусков

  @Column({ type: "date", nullable: true })
  endDate: Date; // для отпусков

  @Column({ type: "int", nullable: true })
  duration: number; // для отпусков (количество дней)

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}