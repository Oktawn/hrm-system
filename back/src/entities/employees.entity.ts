import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UsersEntity } from "./users.entity";
import { DepartmentsEntity } from "./departments.enity";
import { PositionsEntity } from "./positions.entity";
import { LeavesEntity } from "./leaves.entity";
import { TasksEntity } from "./tasks.entity";
import { HrRequestsEntity } from "./hr-requests.entity";

@Entity("employees")
export class EmployeesEntity {

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ type: "date", nullable: true })
  birthDate: Date;

  @Column({ type: "date", nullable: true })
  hireDate: Date;

  @Column({ nullable: true })
  phone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => UsersEntity, user => user.employee, { onDelete: "CASCADE" })
  @JoinColumn()
  user: UsersEntity;

  @ManyToOne(() => DepartmentsEntity, dep => dep.employees, { onDelete: "SET NULL" })
  department: DepartmentsEntity;

  @ManyToOne(() => PositionsEntity, position => position.employees)
  position: PositionsEntity;

  @ManyToOne(() => LeavesEntity, leave => leave.employee)
  leaves: LeavesEntity[];

  @OneToMany(() => TasksEntity, task => task.assignee)
  assignedTasks: TasksEntity[];

  @OneToMany(() => TasksEntity, task => task.creator)
  createdTasks: TasksEntity[];

  @OneToMany(() => HrRequestsEntity, request => request.employee)
  hrRequests: HrRequestsEntity[];


}