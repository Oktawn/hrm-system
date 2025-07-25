import * as ExcelJS from 'exceljs';
import { ITaskStatistics, ITaskStatisticsFilter } from './tasks-statistics.interface';
import { employeeRepository, taskRepository } from '../db/db-rep';
import { TaskStatusEnum } from '../commons/enums/enums';
import createError from 'http-errors';

export class TasksStatisticsService {

  async getTasksStatistics(filter?: ITaskStatisticsFilter): Promise<ITaskStatistics[]> {
    try {
      const employeeQueryBuilder = employeeRepository.createQueryBuilder('employee')
        .leftJoinAndSelect('employee.user', 'user')
        .leftJoinAndSelect('employee.department', 'department')
        .leftJoinAndSelect('employee.position', 'position');

      if (filter?.departmentId) {
        employeeQueryBuilder.andWhere('employee.department.id = :departmentId', { departmentId: filter.departmentId });
      }

      if (filter?.positionId) {
        employeeQueryBuilder.andWhere('employee.position.id = :positionId', { positionId: filter.positionId });
      }

      if (filter?.employeeId) {
        employeeQueryBuilder.andWhere('employee.id = :employeeId', { employeeId: filter.employeeId });
      }

      const employees = await employeeQueryBuilder.getMany();

      const statistics: ITaskStatistics[] = [];

      for (const employee of employees) {
        const stats = await this.getEmployeeTaskStatistics(employee.id, filter);
        statistics.push({
          employeeId: employee.id,
          employeeName: `${employee.lastName || ''} ${employee.firstName || ''} ${employee.middleName || ''}`.trim(),
          department: employee.department?.name,
          position: employee.position?.name,
          ...stats
        });
      }

      return statistics.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    } catch (error) {
      console.error('Error getting tasks statistics:', error);
      throw createError(500, 'Ошибка при получении статистики задач');
    }
  }

  private async getEmployeeTaskStatistics(employeeId: string, filter?: ITaskStatisticsFilter) {
    const assignedTasksQueryBuilder = taskRepository.createQueryBuilder('task')
      .leftJoin('task.assignees', 'assignee')
      .where('assignee.id = :employeeId', { employeeId });

    const createdTasksQueryBuilder = taskRepository.createQueryBuilder('task')
      .where('task.creator.id = :employeeId', { employeeId });

    if (filter?.dateFrom && filter?.dateTo) {
      assignedTasksQueryBuilder.andWhere('task.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo
      });
      createdTasksQueryBuilder.andWhere('task.createdAt BETWEEN :dateFrom AND :dateTo', {
        dateFrom: filter.dateFrom,
        dateTo: filter.dateTo
      });
    } else if (filter?.dateFrom) {
      assignedTasksQueryBuilder.andWhere('task.createdAt >= :dateFrom', { dateFrom: filter.dateFrom });
      createdTasksQueryBuilder.andWhere('task.createdAt >= :dateFrom', { dateFrom: filter.dateFrom });
    } else if (filter?.dateTo) {
      assignedTasksQueryBuilder.andWhere('task.createdAt <= :dateTo', { dateTo: filter.dateTo });
      createdTasksQueryBuilder.andWhere('task.createdAt <= :dateTo', { dateTo: filter.dateTo });
    }

    const [assignedTasks, createdTasks] = await Promise.all([
      assignedTasksQueryBuilder.getMany(),
      createdTasksQueryBuilder.getMany()
    ]);

    const allTaskIds = new Set<number>();
    const tasks = [];

    assignedTasks.forEach(task => {
      if (!allTaskIds.has(task.id)) {
        allTaskIds.add(task.id);
        tasks.push(task);
      }
    });

    createdTasks.forEach(task => {
      if (!allTaskIds.has(task.id)) {
        allTaskIds.add(task.id);
        tasks.push(task);
      }
    });

    const todoCount = tasks.filter(task => task.status === TaskStatusEnum.TODO).length;
    const inProgressCount = tasks.filter(task => task.status === TaskStatusEnum.IN_PROGRESS).length;
    const reviewCount = tasks.filter(task => task.status === TaskStatusEnum.REVIEW).length;
    const doneCount = tasks.filter(task => task.status === TaskStatusEnum.DONE).length;
    const cancelledCount = tasks.filter(task => task.status === TaskStatusEnum.CANCELLED).length;
    const totalTasks = tasks.length;

    const now = new Date();
    const overdueTasks = tasks.filter(task =>
      task.deadline &&
      new Date(task.deadline) < now &&
      task.status !== TaskStatusEnum.DONE &&
      task.status !== TaskStatusEnum.CANCELLED
    ).length;

    const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

    return {
      todoCount,
      inProgressCount,
      reviewCount,
      doneCount,
      cancelledCount,
      totalTasks,
      overdueTasks,
      completionRate
    };
  }

  async exportToExcel(filter?: ITaskStatisticsFilter): Promise<Buffer> {
    try {
      const statistics = await this.getTasksStatistics(filter);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Статистика задач');

      const headers = [
        'ФИО сотрудника',
        'Отдел',
        'Должность',
        'К выполнению',
        'В процессе',
        'На проверке',
        'Выполнено',
        'Отменено',
        'Всего задач',
        'Просрочено',
        'Процент выполнения (%)'
      ];


      worksheet.addRow(['Статистика задач по сотрудникам']);
      worksheet.addRow([]); 

      worksheet.addRow(headers);

      const headerRow = worksheet.getRow(4); 
      headerRow.font = { bold: true };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE6E6FA' }
      };

      statistics.forEach(stat => {
        worksheet.addRow([
          stat.employeeName,
          stat.department || 'Не указан',
          stat.position || 'Не указана',
          stat.todoCount,
          stat.inProgressCount,
          stat.reviewCount,
          stat.doneCount,
          stat.cancelledCount,
          stat.totalTasks,
          stat.overdueTasks,
          stat.completionRate
        ]);
      });

      worksheet.columns = [
        { width: 25 }, // ФИО
        { width: 20 }, // Отдел
        { width: 20 }, // Должность
        { width: 15 }, // К выполнению
        { width: 15 }, // В процессе
        { width: 15 }, // На проверке
        { width: 15 }, // Выполнено
        { width: 15 }, // Отменено
        { width: 15 }, // Всего
        { width: 15 }, // Просрочено
        { width: 20 }  // Процент
      ];

      worksheet.eachRow((row) => {
        row.eachCell(cell => {
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
        });
      });

      if (statistics.length > 0) {
        const totalRow = statistics.length + 5; 
        worksheet.getCell(`A${totalRow}`).value = 'ИТОГО:';
        worksheet.getCell(`A${totalRow}`).font = { bold: true };

        const totalStats = await this.getTotalStatistics(filter);

        worksheet.getCell(`D${totalRow}`).value = totalStats.todoCount;
        worksheet.getCell(`E${totalRow}`).value = totalStats.inProgressCount;
        worksheet.getCell(`F${totalRow}`).value = totalStats.reviewCount;
        worksheet.getCell(`G${totalRow}`).value = totalStats.doneCount;
        worksheet.getCell(`H${totalRow}`).value = totalStats.cancelledCount;
        worksheet.getCell(`I${totalRow}`).value = totalStats.totalTasks;
        worksheet.getCell(`J${totalRow}`).value = totalStats.overdueTasks;
        worksheet.getCell(`K${totalRow}`).value = totalStats.completionRate;

        for (let col = 1; col <= 11; col++) {
          const cell = worksheet.getCell(totalRow, col);
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFD700' }
          };
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw createError(500, 'Ошибка при экспорте в Excel');
    }
  }

  async getTotalStatistics(filter?: ITaskStatisticsFilter) {
    try {
      let queryBuilder = taskRepository.createQueryBuilder('task')
        .leftJoinAndSelect('task.assignees', 'assignees')
        .leftJoinAndSelect('task.creator', 'creator');

      if (filter?.dateFrom && filter?.dateTo) {
        queryBuilder.andWhere('task.createdAt BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filter.dateFrom,
          dateTo: filter.dateTo
        });
      } else if (filter?.dateFrom) {
        queryBuilder.andWhere('task.createdAt >= :dateFrom', { dateFrom: filter.dateFrom });
      } else if (filter?.dateTo) {
        queryBuilder.andWhere('task.createdAt <= :dateTo', { dateTo: filter.dateTo });
      }

      if (filter?.departmentId) {
        queryBuilder.andWhere(
          '(assignees.departmentId = :departmentId OR creator.departmentId = :departmentId)',
          { departmentId: filter.departmentId }
        );
      }

      if (filter?.positionId) {
        queryBuilder.andWhere(
          '(assignees.positionId = :positionId OR creator.positionId = :positionId)',
          { positionId: filter.positionId }
        );
      }

      if (filter?.employeeId) {
        queryBuilder.andWhere(
          '(assignees.id = :employeeId OR creator.id = :employeeId)',
          { employeeId: filter.employeeId }
        );
      }

      const tasks = await queryBuilder.getMany();

      const todoCount = tasks.filter(task => task.status === TaskStatusEnum.TODO).length;
      const inProgressCount = tasks.filter(task => task.status === TaskStatusEnum.IN_PROGRESS).length;
      const reviewCount = tasks.filter(task => task.status === TaskStatusEnum.REVIEW).length;
      const doneCount = tasks.filter(task => task.status === TaskStatusEnum.DONE).length;
      const cancelledCount = tasks.filter(task => task.status === TaskStatusEnum.CANCELLED).length;
      const totalTasks = tasks.length;

      const now = new Date();
      const overdueTasks = tasks.filter(task =>
        task.deadline &&
        new Date(task.deadline) < now &&
        task.status !== TaskStatusEnum.DONE &&
        task.status !== TaskStatusEnum.CANCELLED
      ).length;

      const completionRate = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0;

      return {
        todoCount,
        inProgressCount,
        reviewCount,
        doneCount,
        cancelledCount,
        totalTasks,
        overdueTasks,
        completionRate
      };
    } catch (error) {
      console.error('Error getting total statistics:', error);
      throw createError(500, 'Ошибка при получении общей статистики задач');
    }
  }
}
