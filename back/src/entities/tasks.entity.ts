import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { TaskPriorityEnum, TaskStatusEnum } from "../commons/enums/enums";

@Entity("tasks")
export class TasksEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: TaskStatusEnum, default: TaskStatusEnum.TODO })
  status: TaskStatusEnum;

  @Column({ type: "enum", enum: TaskPriorityEnum, default: TaskPriorityEnum.MEDIUM })
  priority: TaskPriorityEnum;

  @Column({ type: "date", nullable: true })
  deadline: Date;

  @ManyToMany(() => EmployeesEntity, { cascade: true })
  @JoinTable()
  assignees: EmployeesEntity[];

  @ManyToOne(() => EmployeesEntity, employee => employee.createdTasks)
  creator: EmployeesEntity;

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}