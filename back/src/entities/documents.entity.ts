import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { EmployeesEntity } from "./employees.entity";
import { RequestEntity } from "./request.entity";
import { DocumentStatusEnum, DocumentTypeEnum } from "../commons/enums/enums";

@Entity("documents")
export class DocumentEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

  @Column({ type: "enum", enum: DocumentTypeEnum })
  type: DocumentTypeEnum;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: DocumentStatusEnum, default: DocumentStatusEnum.UNDER_REVIEW })
  status: DocumentStatusEnum;

  @Column({ type: "text", nullable: true })
  content: string; // Содержимое документа (для текстовых документов)

  @Column({ type: "varchar", nullable: true })
  templatePath: string; // Путь к шаблону документа

  @Column({ type: "varchar", nullable: true })
  filePath: string; // Путь к сгенерированному файлу

  @Column({ type: "varchar", nullable: true })
  fileUrl: string; // URL для доступа к документу

  @Column({ type: "jsonb", nullable: true })
  templateData: object; // Данные для заполнения шаблона

  @ManyToOne(() => RequestEntity, { onDelete: "CASCADE" })
  sourceRequest: RequestEntity; // Заявка, на основе которой создан документ

  @ManyToOne(() => EmployeesEntity, { onDelete: "CASCADE" })
  requestedBy: EmployeesEntity; // Кто запросил документ

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL", nullable: true })
  createdBy: EmployeesEntity; // Кто создал документ (HR/Admin)

  @ManyToOne(() => EmployeesEntity, { onDelete: "SET NULL", nullable: true })
  signedBy: EmployeesEntity; // Кто подписал документ

  @Column({ type: "timestamp", nullable: true })
  signedAt: Date; // Дата подписания

  @Column({ type: "text", nullable: true })
  rejectionReason: string; // Причина отказа

  @Column({ type: "jsonb", nullable: true })
  metadata: object; // Дополнительные метаданные

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
