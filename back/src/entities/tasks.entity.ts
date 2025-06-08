import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { CommentsEntity } from "./comments.entity";
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

  @ManyToMany(() => EmployeesEntity, { onDelete: "CASCADE" })
  @JoinTable({
    name: "tasks_assignees_employees",
    joinColumn: { name: "tasksId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "employeesId", referencedColumnName: "id" }
  })
  assignees: EmployeesEntity[];

  @ManyToOne(() => EmployeesEntity, employee => employee.createdTasks, { onDelete: "SET NULL" })
  creator: EmployeesEntity;

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @OneToMany(() => CommentsEntity, comment => comment.task)
  comments: CommentsEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}