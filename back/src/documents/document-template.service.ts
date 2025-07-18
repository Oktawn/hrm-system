import * as fs from 'fs-extra';
import * as path from 'path';
import { DocumentTypeEnum } from '../commons/enums/enums';

export class DocumentTemplateService {
  private templatesPath = path.join(__dirname, '../../src/templates/documents');
  private generatedDocsPath = path.join(__dirname, '../../uploads/documents');

  constructor() {
    fs.ensureDirSync(this.generatedDocsPath);
  }

  getTemplatePath(documentType: DocumentTypeEnum): string {
    const templateFileName = `${documentType}.txt`;
    return path.join(this.templatesPath, templateFileName);
  }

  async loadTemplate(documentType: DocumentTypeEnum): Promise<string> {
    const templatePath = this.getTemplatePath(documentType);

    if (!await fs.pathExists(templatePath)) {
      throw new Error(`Template for document type ${documentType} not found`);
    }

    return await fs.readFile(templatePath, 'utf-8');
  }

  fillTemplate(template: string, data: Record<string, any>): string {
    let filledTemplate = template;

    for (const [key, value] of Object.entries(data)) {
      const placeholder = `{${key}}`;
      const replacement = value !== null && value !== undefined ? String(value) : '';
      filledTemplate = filledTemplate.replace(new RegExp(placeholder, 'g'), replacement);
    }

    return filledTemplate;
  }

  async generateDocument(
    documentType: DocumentTypeEnum,
    templateData: Record<string, any>,
    documentId: number
  ): Promise<{ filePath: string; fileUrl: string; content: string }> {
    const template = await this.loadTemplate(documentType);
    const content = this.fillTemplate(template, templateData);

    const fileName = `document_${documentId}_${Date.now()}.txt`;
    const filePath = path.join(this.generatedDocsPath, fileName);

    await fs.writeFile(filePath, content, 'utf-8');

    const fileUrl = `/api/uploads/download/${fileName}`;

    return {
      filePath,
      fileUrl,
      content
    };
  }

  prepareTemplateData(employee: any, request: any, additionalData: Record<string, any> = {}): Record<string, any> {
    const currentDate = new Date();
    const documentNumber = `№ ${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;

    const gender = this.determineGender(employee.firstName, employee.middleName);
    const genderEnding = gender === 'male' ? '' : 'а';

    const baseData = {
      employeeFullName: `${employee.lastName} ${employee.firstName} ${employee.middleName || ''}`.trim(),
      employeeFirstName: employee.firstName,
      employeeLastName: employee.lastName,
      employeeMiddleName: employee.middleName || '',
      employeeBirthDate: employee.birthDate ? new Date(employee.birthDate).getFullYear() : '',
      employeeNumber: employee.id,
      hireDate: employee.hireDate ? this.formatDate(employee.hireDate) : '',

      positionName: employee.position?.name || 'Не указана',
      departmentName: employee.department?.name || 'Не указан',

      companyName: process.env.COMPANY_NAME || 'ООО "Название компании"',

      documentNumber,
      issueDate: this.formatDate(currentDate),
      currentYear: currentDate.getFullYear(),

      gender: gender === 'male' ? 'он' : 'она',
      genderEnding,

      requestTitle: request?.title || '',
      requestDescription: request?.description || '',
      purpose: this.determinePurpose(request?.type),

      hrManagerName: '',
      accountantName: '',
      signerName: '',

      additionalInfo: '',

      ...this.getTypeSpecificData(employee, request),

      ...additionalData
    };

    return baseData;
  }

  private determineGender(firstName: string, middleName?: string): 'male' | 'female' {
    if (middleName) {
      if (middleName.endsWith('ич')) return 'male';
      if (middleName.endsWith('на')) return 'female';
    }

    const maleEndings = ['р', 'н', 'л', 'й', 'к', 'м', 'с', 'т', 'в', 'д', 'г', 'з', 'б', 'п', 'ф', 'х', 'ц', 'ч', 'ш', 'щ'];
    const femaleEndings = ['а', 'я', 'е', 'и', 'ь'];

    const lastChar = firstName.toLowerCase().slice(-1);

    if (femaleEndings.includes(lastChar)) return 'female';
    if (maleEndings.includes(lastChar)) return 'male';

    return 'male';
  }

  private determinePurpose(requestType?: string): string {
    switch (requestType) {
      case 'document':
        return 'по месту требования';
      case 'certificate':
        return 'для предоставления в банк';
      default:
        return 'по месту требования';
    }
  }

  private getTypeSpecificData(employee: any, request: any): Record<string, any> {
    const data: Record<string, any> = {};

    data.baseSalary = employee.position?.baseSalary || 'Не указан';
    data.averageSalary = 'По запросу';
    data.averageSalaryYear = 'По запросу';
    data.paymentDetails = '';
    data.paymentSystem = 'Оклад';
    data.paymentConditions = '';

    data.contractType = 'Трудовой договор';
    data.contractDate = employee.hireDate ? this.formatDate(employee.hireDate) : '';
    data.workSchedule = '5-дневная рабочая неделя, 8-часовой рабочий день';
    data.workTimeConditions = '';
    data.employmentStatus = 'Работает по настоящее время';
    data.additionalEmploymentInfo = '';

    data.vacationType = 'Ежегодный оплачиваемый отпуск';
    data.vacationStartDate = request?.startDate ? this.formatDate(request.startDate) : '';
    data.vacationEndDate = request?.endDate ? this.formatDate(request.endDate) : '';
    data.vacationDays = request?.duration || '';
    data.vacationDetails = '';
    data.usedVacationDays = 'По запросу';
    data.remainingVacationDays = 'По запросу';
    data.additionalVacationInfo = '';
    data.annualVacationDays = '28';
    data.vacationConditions = '';

    data.medicalInfo = '';
    data.sickLeaveStartDate = '';
    data.sickLeaveEndDate = '';
    data.sickLeaveDays = '';
    data.diagnosis = '';
    data.doctorName = '';
    data.medicalInstitution = '';
    data.additionalMedicalInfo = '';
    data.workRecommendations = '';

    data.education = 'По запросу';
    data.specialty = 'По запросу';
    data.workHistory = '';
    data.incentivesAndPenalties = 'Отсутствуют';
    data.trainingHistory = '';
    data.additionalPersonalInfo = '';

    data.additionalContractConditions = '';

    data.documentTitle = request?.title || 'Документ';
    data.documentContent = request?.description || '';

    return data;
  }

  private formatDate(date: string | Date): string {
    const d = new Date(date);
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];

    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`;
  }


  async deleteDocument(filePath: string): Promise<void> {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  async templateExists(documentType: DocumentTypeEnum): Promise<boolean> {
    const templatePath = this.getTemplatePath(documentType);
    return await fs.pathExists(templatePath);
  }

  async getAvailableTemplates(): Promise<DocumentTypeEnum[]> {
    const templates: DocumentTypeEnum[] = [];

    for (const type of Object.values(DocumentTypeEnum)) {
      if (await this.templateExists(type)) {
        templates.push(type);
      }
    }

    return templates;
  }
}
