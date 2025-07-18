import { useState, Fragment } from 'react';
import tasksService, { type Task } from '../../services/tasks.service';
import StatusSelector from '../StatusSelector/StatusSelector';
import { useAuthStore } from '../../stores/auth.store';
import { getPriorityCSSColor, getPriorityText } from '../../utils/status.utils';
import './TasksTable.css';

interface TasksTableProps {
  tasks: Task[];
  onTaskUpdate: () => void;
}

function TasksTable({ tasks, onTaskUpdate }: TasksTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { user: currentUser } = useAuthStore();

  const canChangeStatus = (task: Task) => {
    if (!currentUser || !currentUser.employeeId) return false;

    const isCreator = task.creator.id === currentUser.employeeId;
    const isAssignee = task.assignees.some(assignee => assignee.id === currentUser.employeeId);
    const isManager = currentUser.role === 'admin' || currentUser.role === 'hr' || currentUser.role === 'manager';

    return isCreator || isAssignee || isManager;
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await tasksService.updateStatus(taskId, newStatus);
      onTaskUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };


  const toggleRowExpansion = (taskId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="tasks-table">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Статус</th>
              <th>Приоритет</th>
              <th>Создатель</th>
              <th>Исполнители</th>
              <th>Срок</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <Fragment key={task.id}>
                <tr className="task-row">
                  <td>{task.id}</td>
                  <td>
                    <div className="task-title-cell">
                      <button
                        className="expand-button"
                        onClick={() => toggleRowExpansion(task.id)}
                      >
                        {expandedRows.has(task.id) ? '▼' : '▶'}
                      </button>
                      <span className="task-title">{task.title}</span>
                    </div>
                  </td>
                  <td>
                    <StatusSelector
                      currentStatus={task.status}
                      type="task"
                      onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                      disabled={!canChangeStatus(task)}
                    />
                  </td>
                  <td>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityCSSColor(task.priority) }}
                    >
                      {getPriorityText(task.priority)}
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      {task.creator.firstName} {task.creator.lastName}
                    </div>
                  </td>
                  <td>
                    <div className="assignees-list">
                      {task.assignees.length > 0 ? (
                        task.assignees.slice(0, 2).map((assignee, index) => (
                          <span key={assignee.id} className="assignee-name">
                            {assignee.firstName} {assignee.lastName}
                            {index < Math.min(task.assignees.length, 2) - 1 && ', '}
                          </span>
                        ))
                      ) : (
                        <span className="no-assignees">Не назначено</span>
                      )}
                      {task.assignees.length > 2 && (
                        <span className="more-assignees">
                          +{task.assignees.length - 2} еще
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {task.deadline ? (
                      <span className={`deadline ${new Date(task.deadline) < new Date() ? 'overdue' : ''}`}>
                        {formatDate(task.deadline)}
                      </span>
                    ) : (
                      <span className="no-deadline">Не указан</span>
                    )}
                  </td>
                </tr>

                {expandedRows.has(task.id) && (
                  <tr className="expanded-row">
                    <td colSpan={8}>
                      <div className="task-details">
                        <div className="task-description">
                          <h4>Описание:</h4>
                          <p>{task.description || 'Описание отсутствует'}</p>
                        </div>

                        <div className="task-meta">
                          <div className="meta-item">
                            <strong>Создано:</strong> {formatDate(task.createdAt)}
                          </div>
                          <div className="meta-item">
                            <strong>Обновлено:</strong> {formatDate(task.updatedAt)}
                          </div>
                          {task.assignees.length > 2 && (
                            <div className="meta-item">
                              <strong>Все исполнители:</strong>
                              <div className="all-assignees">
                                {task.assignees.map(assignee => (
                                  <span key={assignee.id} className="assignee-full">
                                    {assignee.firstName} {assignee.lastName}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>

        {tasks.length === 0 && (
          <div className="empty-state">
            <p>Задачи не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksTable;
