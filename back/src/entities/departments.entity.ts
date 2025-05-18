import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { PositionsEntity } from "./positions.entity";

@Entity("departments")
export class DepartmentsEntity {

  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EmployeesEntity, employee => employee.department)
  employees: EmployeesEntity[];

  @OneToMany(() => PositionsEntity, position => position.department)
  positions: PositionsEntity[];
}