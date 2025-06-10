import { Knex } from "knex";
import { DocumentTemplateService } from "../documents/document-template.service";
import { DocumentTypeEnum } from "../commons/enums/enums";

export async function seed(knex: Knex): Promise<void> {

    await knex("documents").del();

    const requests = await knex("requests")
        .select("*")
        .whereIn("type", ["document", "certificate", "leave_vacation", "leave_sick", "leave_personal"])
        .orderBy("id")
        .limit(15); 

    const hrEmployees = await knex("employees")
        .join("users", "employees.userId", "users.id")
        .where("users.role", "hr")
        .select("employees.*");

    if (requests.length === 0) {
        return;
    }

    const documents = [];
    const templateService = new DocumentTemplateService();

    const documentStatuses = ['under_review', 'draft'];
    
    const documentTypeMapping = {
        'document': ['work_certificate', 'employment_certificate', 'contract_copy'],
        'certificate': ['salary_certificate', 'personal_data_extract'],
        'leave_vacation': ['vacation_certificate'],
        'leave_sick': ['medical_certificate'],
        'leave_personal': ['work_certificate'] // Используем справку с места работы для отгулов
    };

    const documentTitles = {
        'work_certificate': 'Справка с места работы',
        'salary_certificate': 'Справка о доходах',
        'employment_certificate': 'Справка о трудоустройстве',
        'vacation_certificate': 'Справка об отпуске',
        'medical_certificate': 'Медицинская справка',
        'personal_data_extract': 'Выписка из личного дела',
        'contract_copy': 'Копия трудового договора'
    };

    for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const availableTypes = documentTypeMapping[request.type] || ['work_certificate'];
        const documentType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        const status = documentStatuses[Math.floor(Math.random() * documentStatuses.length)];
        
        const creator = hrEmployees.length > 0 ? 
            hrEmployees[Math.floor(Math.random() * hrEmployees.length)] : null;

        const title = `${documentTitles[documentType]} - ${request.title}`;
        
        const requestCreator = await knex("employees").where("id", request.creatorId).first();

        if (!requestCreator) continue;

        const templateData = {
            employeeFullName: `${requestCreator.lastName} ${requestCreator.firstName} ${requestCreator.middleName || ''}`.trim(),
            employeeFirstName: requestCreator.firstName,
            employeeLastName: requestCreator.lastName,
            employeeMiddleName: requestCreator.middleName || '',
            employeeBirthDate: requestCreator.birthDate ? new Date(requestCreator.birthDate).getFullYear() : '1990',
            employeeNumber: requestCreator.id,
            hireDate: requestCreator.hireDate ? new Date(requestCreator.hireDate).toLocaleDateString('ru-RU') : '01.01.2020',
            positionName: 'Специалист',
            departmentName: 'Отдел разработки',
            companyName: 'ООО "Современные технологии"',
            documentNumber: `№ ${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 1000)}`,
            issueDate: new Date().toLocaleDateString('ru-RU'),
            currentYear: new Date().getFullYear(),
            gender: 'он',
            genderEnding: '',
            purpose: 'по месту требования',
            hrManagerName: creator ? `${creator.firstName} ${creator.lastName}` : 'Специалист отдела кадров',
            signerName: creator ? `${creator.firstName} ${creator.lastName}` : 'Специалист отдела кадров',
            additionalInfo: '',
            baseSalary: '50000',
            averageSalary: '52000',
            averageSalaryYear: '51000',
            paymentSystem: 'Оклад',
            contractType: 'Трудовой договор на неопределенный срок',
            workSchedule: '5-дневная рабочая неделя, 8-часовой рабочий день',
            employmentStatus: 'Работает по настоящее время',
            annualVacationDays: '28',
            education: 'Высшее',
            specialty: 'Информационные технологии'
        };

        let content = '';
        switch (documentType) {
            case 'work_certificate':
                content = `СПРАВКА с места работы\n\nНастоящая справка выдана ${templateData.employeeFullName} в том, что ${templateData.gender} действительно работает в ${templateData.companyName}.\n\nДолжность: ${templateData.positionName}\nОтдел: ${templateData.departmentName}\nДата начала работы: ${templateData.hireDate}\n\nСправка выдана для предоставления ${templateData.purpose}.\n\nДата выдачи: ${templateData.issueDate}`;
                break;
            case 'salary_certificate':
                content = `СПРАВКА о доходах\n\nНастоящая справка выдана ${templateData.employeeFullName} о размере заработной платы.\n\nОклад: ${templateData.baseSalary} рублей\nСредняя заработная плата за 6 месяцев: ${templateData.averageSalary} рублей\n\nСправка выдана для предоставления ${templateData.purpose}.\n\nДата выдачи: ${templateData.issueDate}`;
                break;
            case 'employment_certificate':
                content = `СПРАВКА о трудоустройстве\n\nНастоящая справка выдана ${templateData.employeeFullName} о том, что ${templateData.gender} трудоустроен в ${templateData.companyName}.\n\nДолжность: ${templateData.positionName}\nТип договора: ${templateData.contractType}\nРежим работы: ${templateData.workSchedule}\n\nСправка выдана для предоставления ${templateData.purpose}.\n\nДата выдачи: ${templateData.issueDate}`;
                break;
            case 'personal_data_extract':
                content = `ВЫПИСКА из личного дела\n\nСотрудник: ${templateData.employeeFullName}\nОбразование: ${templateData.education}\nСпециальность: ${templateData.specialty}\nДата приема: ${templateData.hireDate}\nДолжность: ${templateData.positionName}\n\nВыписка составлена для предоставления ${templateData.purpose}.\n\nДата составления: ${templateData.issueDate}`;
                break;
            case 'contract_copy':
                content = `КОПИЯ ТРУДОВОГО ДОГОВОРА\n\nРаботодатель: ${templateData.companyName}\nРаботник: ${templateData.employeeFullName}\n\nДата заключения: ${templateData.hireDate}\nДолжность: ${templateData.positionName}\nОклад: ${templateData.baseSalary} рублей\nРежим работы: ${templateData.workSchedule}\n\nКопия выдана для предоставления ${templateData.purpose}.\n\nДата выдачи: ${templateData.issueDate}`;
                break;
            default:
                content = `ДОКУМЕНТ\n\n${request.title}\n\n${request.description}\n\nДата выдачи: ${templateData.issueDate}`;
        }

        let filePath = null;
        let fileUrl = null;
        
        try {
            const tempDocumentId = Date.now() + Math.floor(Math.random() * 1000);
            const documentFile = await templateService.generateDocument(
                documentType as DocumentTypeEnum, 
                templateData, 
                tempDocumentId
            );
            filePath = documentFile.filePath;
            fileUrl = documentFile.fileUrl;
            content = documentFile.content; 
        } catch (error) {
            console.warn(`Could not generate file for document ${title}:`, error.message);
        }

        documents.push({
            type: documentType,
            title: title,
            description: `Документ создан на основе заявки #${request.id}: ${request.title}`,
            status: status,
            content: content,
            filePath: filePath,
            fileUrl: fileUrl,
            templatePath: templateService.getTemplatePath(documentType as DocumentTypeEnum),
            sourceRequestId: request.id,
            requestedById: requestCreator.id,
            createdById: creator ? creator.id : null,
            signedById: null,
            signedAt: null,
            rejectionReason: null,
            templateData: JSON.stringify(templateData),
            metadata: JSON.stringify({
                requestType: request.type,
                priority: request.priority,
                generatedAt: new Date().toISOString(),
                documentVersion: '1.0',
                autoGenerated: true,
                hasFile: !!fileUrl
            })
        });
    }

    await knex("documents").insert(documents);
}