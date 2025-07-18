import { Fragment, useState } from 'react';
import requestsService from '../../services/requests.service';
import type { Request } from '../../types/request.types';
import StatusSelector from '../StatusSelector/StatusSelector';
import { useAuthStore } from '../../stores/auth.store';
import { getPriorityCSSColor, getPriorityText, getRequestTypeText } from '../../utils/status.utils';
import './RequestsTable.css';

interface RequestsTableProps {
  requests: Request[];
  onRequestUpdate: () => void;
}

function RequestsTable({ requests, onRequestUpdate }: RequestsTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const { user: currentUser } = useAuthStore();

  const canChangeStatus = (request: Request) => {
    if (!currentUser) return false;

    const isCreator = request.creator.id === currentUser.id;
    const isAssignee = request.assignee?.id === currentUser.id;
    const isManager = currentUser.role === 'admin' || currentUser.role === 'hr' || currentUser.role === 'manager';

    return isCreator || isAssignee || isManager;
  };

  const handleStatusChange = async (requestId: number, newStatus: string) => {
    try {
      await requestsService.updateStatus(requestId, newStatus);
      onRequestUpdate();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };


  const toggleRowExpansion = (requestId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(requestId)) {
      newExpanded.delete(requestId);
    } else {
      newExpanded.add(requestId);
    }
    setExpandedRows(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <div className="requests-table">
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Название</th>
              <th>Тип</th>
              <th>Статус</th>
              <th>Приоритет</th>
              <th>Создатель</th>
              <th>Исполнитель</th>
              <th>Дата создания</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(request => (
              <Fragment key={request.id}>
                <tr className="request-row">
                  <td>{request.id}</td>
                  <td>
                    <div className="request-title-cell">
                      <button
                        className="expand-button"
                        onClick={() => toggleRowExpansion(request.id)}
                      >
                        {expandedRows.has(request.id) ? '▼' : '▶'}
                      </button>
                      <span className="request-title">{request.title}</span>
                    </div>
                  </td>
                  <td>
                    <span className="type-badge">
                      {getRequestTypeText(request.type)}
                    </span>
                  </td>
                  <td>
                    <StatusSelector
                      currentStatus={request.status}
                      type="request"
                      onStatusChange={(newStatus) => handleStatusChange(request.id, newStatus)}
                      disabled={!canChangeStatus(request)}
                    />
                  </td>
                  <td>
                    <span
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityCSSColor(request.priority) }}
                    >
                      {getPriorityText(request.priority)}
                    </span>
                  </td>
                  <td>
                    <div className="user-info">
                      {request.creator.firstName} {request.creator.lastName}
                    </div>
                  </td>
                  <td>
                    <div className="user-info">
                      {request.assignee ? (
                        `${request.assignee.firstName} ${request.assignee.lastName}`
                      ) : (
                        <span className="no-assignee">Не назначен</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="date">
                      {formatDate(request.createdAt)}
                    </span>
                  </td>
                </tr>

                {expandedRows.has(request.id) && (
                  <tr className="expanded-row">
                    <td colSpan={9}>
                      <div className="request-details">
                        <div className="request-description">
                          <h4>Описание:</h4>
                          <p>{request.description || 'Описание отсутствует'}</p>
                        </div>

                        <div className="request-meta">
                          <div className="meta-item">
                            <strong>Создано:</strong> {formatDate(request.createdAt)}
                          </div>
                          <div className="meta-item">
                            <strong>Обновлено:</strong> {formatDate(request.updatedAt)}
                          </div>
                          {request.startDate && (
                            <div className="meta-item">
                              <strong>Дата начала:</strong> {formatDate(request.startDate)}
                            </div>
                          )}
                          {request.endDate && (
                            <div className="meta-item">
                              <strong>Дата окончания:</strong> {formatDate(request.endDate)}
                            </div>
                          )}
                          {request.duration && (
                            <div className="meta-item">
                              <strong>Продолжительность:</strong> {request.duration} дней
                            </div>
                          )}
                          {request.attachments && request.attachments.length > 0 && (
                            <div className="meta-item">
                              <strong>Файлы:</strong> {request.attachments.length} прикреплено
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

        {requests.length === 0 && (
          <div className="empty-state">
            <p>Заявки не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsTable;
