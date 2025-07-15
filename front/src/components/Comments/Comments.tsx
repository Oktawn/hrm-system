import { useState, useEffect, useCallback } from 'react';
import { commentsService, type IComment, type ICreateComment } from '../../services/comments.service';
import { useAuthStore } from '../../stores/auth.store';
import SimpleFileUpload from '../SimpleFileUpload/SimpleFileUpload';
import { Button, Typography, message } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import './Comments.css';
import type { FileAttachment } from '../../types/document.types';
import { api } from '../../services/auth.service';

const { Text } = Typography;

interface CommentsProps {
  type: 'task' | 'request';
  itemId: number;
  isVisible: boolean;
  onClose: () => void;
}

function Comments({ type, itemId, isVisible, onClose }: CommentsProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const { user: currentUser } = useAuthStore();
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = type === 'task'
        ? await commentsService.getCommentsByTask(itemId)
        : await commentsService.getCommentsByRequest(itemId);
      setComments(data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  }, [itemId, type]);

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [fetchComments, isVisible, itemId, type]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData: ICreateComment = {
        content: newComment,
        type,
        ...(type === 'task' ? { taskId: itemId } : { requestId: itemId })
      };

      let createdComment;
      if (attachments.length > 0) {
        createdComment = await commentsService.createCommentWithFiles(commentData, attachments);
      } else {
        createdComment = await commentsService.createComment(commentData);
      }

      setComments([...comments, createdComment]);
      setNewComment('');
      setAttachments([]);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const updatedComment = await commentsService.updateComment(commentId, { content: editText });
      setComments(comments.map(comment =>
        comment.id === commentId ? updatedComment : comment
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить комментарий?')) return;

    try {
      await commentsService.deleteComment(commentId);
      setComments(comments.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const startEditing = (comment: IComment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  const canEditComment = (comment: IComment) => {
    return comment.author.id === currentUser?.id ||
      currentUser?.role === 'admin' ||
      currentUser?.role === 'hr' ||
      currentUser?.role === 'manager';
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await api.get(`/uploads/download/${filename}`, {
        responseType: 'blob'
      });

      // Получаем MIME-тип из заголовков ответа
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Создаем blob с правильным MIME-типом
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка скачивания файла:', error);
      message.error('Не удалось скачать файл');
    }
  };

  const handleView = async (filename: string) => {
    try {
      const response = await api.get(`/uploads/view/${filename}`, {
        responseType: 'blob'
      });

      // Получаем MIME-тип из заголовков ответа
      const contentType = response.headers['content-type'] || 'application/octet-stream';
      
      // Создаем blob с правильным MIME-типом
      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Очищаем URL через некоторое время
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Ошибка просмотра файла:', error);
      message.error('Не удалось открыть файл');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isImage = (mimetype?: string) => {
    return mimetype && mimetype.startsWith('image/');
  };

  if (!isVisible) return null;

  return (
    <div className="comments-overlay">
      <div className="comments-modal">
        <div className="comments-header">
          <h3>Комментарии</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <div className="comments-content">
          {loading ? (
            <div className="loading">Загрузка комментариев...</div>
          ) : (
            <div className="comments-list">
              {comments.length === 0 ? (
                <div className="no-comments">Комментариев пока нет</div>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.author.firstName} {comment.author.lastName}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleString('ru-RU')}
                      </span>
                    </div>

                    {editingComment === comment.id ? (
                      <div className="comment-edit">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="edit-textarea"
                        />
                        <div className="edit-actions">
                          <button
                            onClick={() => handleEditComment(comment.id)}
                            className="save-button"
                          >
                            Сохранить
                          </button>
                          <button
                            onClick={cancelEditing}
                            className="cancel-button"
                          >
                            Отмена
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="comment-content-wrapper">
                        <div className="comment-text">{comment.content}</div>

                        {/* Отображение вложений */}
                        {comment.attachments && comment.attachments.length > 0 && (
                          <div className="comment-attachments">
                            <Text strong style={{ fontSize: '12px', color: '#666' }}>
                              Вложения:
                            </Text>
                            <div style={{ marginTop: 8 }}>
                              {comment.attachments.map((attachment: FileAttachment, index: number) => (
                                <div key={index} className="attachment-item" style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  marginBottom: 4,
                                  padding: '4px 8px',
                                  backgroundColor: '#f5f5f5',
                                  borderRadius: '4px',
                                  fontSize: '12px'
                                }}>
                                  <span style={{ flex: 1, marginRight: 8 }}>
                                    {attachment.originalName} ({formatFileSize(attachment.size)})
                                  </span>
                                  <div style={{ display: 'flex', gap: 4 }}>
                                    {isImage(attachment.mimetype) && (
                                      <Button
                                        type="text"
                                        size="small"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleView(attachment.filename)}
                                        title="Просмотр"
                                      />
                                    )}
                                    <Button
                                      type="text"
                                      size="small"
                                      icon={<DownloadOutlined />}
                                      onClick={() => handleDownload(attachment.filename)}
                                      title="Скачать"
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {canEditComment(comment) && (
                          <div className="comment-actions">
                            <button
                              onClick={() => startEditing(comment)}
                              className="edit-button"
                            >
                              Редактировать
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="delete-button"
                            >
                              Удалить
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          <div className="add-comment">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Добавить комментарий..."
              className="comment-textarea"
            />

            {/* Компонент загрузки файлов */}
            <div style={{ marginTop: 12, marginBottom: 12 }}>
              <SimpleFileUpload
                files={attachments}
                onFilesChange={setAttachments}
                maxFiles={3}
                maxSize={10 * 1024 * 1024}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
            </div>

            <button
              onClick={handleAddComment}
              className="add-comment-button"
              disabled={!newComment.trim()}
            >
              Добавить комментарий
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
