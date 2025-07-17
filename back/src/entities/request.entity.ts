import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { CommentsEntity } from "./comments.entity";
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

  @ManyToOne(() => EmployeesEntity, employee => employee.createdRequests, { onDelete: "CASCADE" })
  creator: EmployeesEntity;

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL" })
  assignee: EmployeesEntity;

  @Column({ type: "date", nullable: true })
  startDate: Date; // для отпусков

  @Column({ type: "date", nullable: true })
  endDate: Date; // для отпусков

  @Column({ type: "int", nullable: true })
  duration: number; // для отпусков (количество дней)

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @OneToMany(() => CommentsEntity, comment => comment.request)
  comments: CommentsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}