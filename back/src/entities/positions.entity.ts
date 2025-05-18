import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { DepartmentsEntity } from "./departments.entity";

@Entity("positions")
export class PositionsEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true, type: "decimal" })
  baseSalary: number;

  @Column({ nullable: true })
  grade: string;

  @OneToMany(() => EmployeesEntity, employee => employee.position)
  employees: EmployeesEntity[];

  @ManyToOne(()=>DepartmentsEntity, department => department.positions, { onDelete: "SET NULL" })
  department: DepartmentsEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

