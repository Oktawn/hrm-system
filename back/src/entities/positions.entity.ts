import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

