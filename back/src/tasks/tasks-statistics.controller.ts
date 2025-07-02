import { Request, Response, NextFunction } from 'express';
import { TasksStatisticsService } from './tasks-statistics.service';
import { ITaskStatisticsFilter } from './tasks-statistics.interface';

export class TasksStatisticsController {
  private tasksStatisticsService = new TasksStatisticsService();

  getStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: ITaskStatisticsFilter = {
        departmentId: req.query.departmentId as string,
        positionId: req.query.positionId as string,
        employeeId: req.query.employeeId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      Object.keys(filter).forEach(key => 
        filter[key as keyof ITaskStatisticsFilter] === undefined && 
        delete filter[key as keyof ITaskStatisticsFilter]
      );

      const statistics = await this.tasksStatisticsService.getTasksStatistics(filter);
      
      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      next(error);
    }
  }

  exportToExcel = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: ITaskStatisticsFilter = {
        departmentId: req.query.departmentId as string,
        positionId: req.query.positionId as string,
        employeeId: req.query.employeeId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      Object.keys(filter).forEach(key => 
        filter[key as keyof ITaskStatisticsFilter] === undefined && 
        delete filter[key as keyof ITaskStatisticsFilter]
      );

      const excelBuffer = await this.tasksStatisticsService.exportToExcel(filter);
      
      // имя файла с датой
      const date = new Date().toISOString().split('T')[0];
      const filename = `task-statistics-${date}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', excelBuffer.length);

      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }

  getTotalStatistics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const filter: ITaskStatisticsFilter = {
        departmentId: req.query.departmentId as string,
        positionId: req.query.positionId as string,
        employeeId: req.query.employeeId as string,
        dateFrom: req.query.dateFrom as string,
        dateTo: req.query.dateTo as string,
      };

      Object.keys(filter).forEach(key => 
        filter[key as keyof ITaskStatisticsFilter] === undefined && 
        delete filter[key as keyof ITaskStatisticsFilter]
      );

      const totalStats = await this.tasksStatisticsService.getTotalStatistics(filter);
      
      res.status(200).json({
        success: true,
        data: totalStats
      });
    } catch (error) {
      next(error);
    }
  }
}
