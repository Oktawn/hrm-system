import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { TasksEntity } from './tasks.entity';
import { RequestEntity } from './request.entity';
import { EmployeesEntity } from './employees.entity';

@Entity("comments")
export class CommentsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  content: string;

  @Column({
    type: 'enum',
    enum: ['task', 'request'],
    default: 'task'
  })
  type: 'task' | 'request';

  @ManyToOne(() => TasksEntity, task => task.comments, { nullable: true, onDelete: 'CASCADE' })
  task: TasksEntity;

  @ManyToOne(() => RequestEntity, request => request.comments, { nullable: true, onDelete: 'CASCADE' })
  request: RequestEntity;

  @ManyToOne(() => EmployeesEntity, employee => employee.comments, { onDelete: 'CASCADE' })
  author: EmployeesEntity;

  @Column({ type: "jsonb", nullable: true })
  attachments: object;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
