import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./users.entity";
import { DepartmentsEntity } from "./departments.entity";
import { PositionsEntity } from "./positions.entity";
import { TasksEntity } from "./tasks.entity";
import { RequestEntity } from "./request.entity";
import { CommentsEntity } from "./comments.entity";

@Entity("employees")
export class EmployeesEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date;

  @Column({ type: "date", nullable: true })
  hireDate: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ unique: true, nullable: true })
  tgID: number;

  @Column({ nullable: true })
  tgUsername: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UsersEntity, user => user.employee, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UsersEntity;

  @ManyToOne(() => DepartmentsEntity, dep => dep.employees, { onDelete: "SET NULL" })
  department: DepartmentsEntity;

  @ManyToOne(() => PositionsEntity, position => position.employees, { onDelete: "SET NULL" })
  position: PositionsEntity;

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL" })
  assignedManager: EmployeesEntity;

  @OneToMany(() => TasksEntity, task => task.creator)
  createdTasks: TasksEntity[];

  @OneToMany(() => RequestEntity, request => request.creator)
  createdRequests: RequestEntity[];

  @OneToMany(() => CommentsEntity, comment => comment.author)
  comments: CommentsEntity[];
}