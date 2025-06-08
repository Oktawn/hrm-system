import React, { useState } from 'react';
import './StatusSelector.css';

interface StatusSelectorProps {
  currentStatus: string;
  type: 'task' | 'request';
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ 
  currentStatus, 
  type, 
  onStatusChange, 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const taskStatuses = [
    { value: 'todo', label: 'К выполнению', color: '#6c757d' },
    { value: 'in_progress', label: 'В работе', color: '#007bff' },
    { value: 'review', label: 'На проверке', color: '#ffc107' },
    { value: 'done', label: 'Выполнено', color: '#28a745' },
    { value: 'cancelled', label: 'Отменено', color: '#dc3545' }
  ];

  const requestStatuses = [
    { value: 'pending', label: 'Ожидает', color: '#6c757d' },
    { value: 'approved', label: 'Одобрено', color: '#28a745' },
    { value: 'rejected', label: 'Отклонено', color: '#dc3545' },
    { value: 'in_progress', label: 'В работе', color: '#007bff' }
  ];

  const statuses = type === 'task' ? taskStatuses : requestStatuses;
  const currentStatusObj = statuses.find(s => s.value === currentStatus);

  const handleStatusSelect = (newStatus: string) => {
    if (newStatus !== currentStatus) {
      onStatusChange(newStatus);
    }
    setIsOpen(false);
  };

  if (disabled) {
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: currentStatusObj?.color || '#6c757d' }}
      >
        {currentStatusObj?.label || currentStatus}
      </span>
    );
  }

  return (
    <div className="status-selector">
      <button
        className="status-current"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: currentStatusObj?.color || '#6c757d' }}
      >
        {currentStatusObj?.label || currentStatus}
        <span className="status-arrow">▼</span>
      </button>
      
      {isOpen && (
        <div className="status-dropdown">
          {statuses.map(status => (
            <button
              key={status.value}
              className={`status-option ${status.value === currentStatus ? 'current' : ''}`}
              onClick={() => handleStatusSelect(status.value)}
              style={{ backgroundColor: status.color }}
            >
              {status.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatusSelector;
