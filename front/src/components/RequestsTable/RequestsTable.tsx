import React, { useState } from 'react';
import requestsService, { type Request } from '../../services/requests.service';
import Comments from '../Comments/Comments';
import StatusSelector from '../StatusSelector/StatusSelector';
import { useAuthStore } from '../../stores/auth.store';
import './RequestsTable.css';

interface RequestsTableProps {
  requests: Request[];
  onRequestUpdate: () => void;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ requests, onRequestUpdate }) => {
  const [showComments, setShowComments] = useState<{ requestId: number; visible: boolean }>({ requestId: 0, visible: false });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  
  const { user: currentUser } = useAuthStore();

  const canChangeStatus = (request: Request) => {
    if (!currentUser) return false;
    
    const isCreator = request.creator.id === currentUser.id;
    const isAssignee = request.assignee?.id === currentUser.id;
    const isManager = currentUser.role === 'ADMIN' || currentUser.role === 'HR' || currentUser.role === 'MANAGER';
    
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

  const handleShowComments = (requestId: number) => {
    setShowComments({ requestId, visible: true });
  };

  const handleCloseComments = () => {
    setShowComments({ requestId: 0, visible: false });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return '#28a745';
      case 'medium': return '#ffc107';
      case 'high': return '#fd7e14';
      case 'critical': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Низкий';
      case 'medium': return 'Средний';
      case 'high': return 'Высокий';
      case 'critical': return 'Критический';
      default: return priority;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vacation': return 'Отпуск';
      case 'sick_leave': return 'Больничный';
      case 'business_trip': return 'Командировка';
      case 'remote_work': return 'Удаленная работа';
      case 'other': return 'Другое';
      default: return type;
    }
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
              <React.Fragment key={request.id}>
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
                      {getTypeLabel(request.type)}
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
                      style={{ backgroundColor: getPriorityColor(request.priority) }}
                    >
                      {getPriorityLabel(request.priority)}
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
                  <td>
                    <div className="actions">
                      <button 
                        className="action-button comment-button"
                        onClick={() => handleShowComments(request.id)}
                        title="Комментарии"
                      >
                        💬
                      </button>
                    </div>
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
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {requests.length === 0 && (
          <div className="empty-state">
            <p>Заявки не найдены</p>
          </div>
        )}
      </div>
      
      <Comments
        type="request"
        itemId={showComments.requestId}
        isVisible={showComments.visible}
        onClose={handleCloseComments}
      />
    </div>
  );
};

export default RequestsTable;
