import { useState, useEffect, useCallback } from 'react';
import { commentsService, type IComment, type ICreateComment } from '../../services/comments.service';
import { useAuthStore } from '../../stores/auth.store';
import SimpleFileUpload from '../SimpleFileUpload/SimpleFileUpload';
import { Button, Typography, message, Modal, Space, Input, List, Avatar } from 'antd';
import { DownloadOutlined, EyeOutlined, ExclamationCircleOutlined, SaveOutlined, CloseOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import './Comments.css';
import type { FileAttachment } from '../../types/document.types';
import { api } from '../../services/auth.service';
import { UserRoleEnum } from '../../utils/status.utils';

const { Text } = Typography;

interface CommentsProps {
  type: 'task' | 'request';
  itemId: number;
  onCommentsUpdate?: () => void;
}

function Comments({ type, itemId, onCommentsUpdate }: CommentsProps) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const { user: currentUser } = useAuthStore();

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data: IComment[] = type === 'task'
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
    fetchComments();
  }, [fetchComments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      message.warning('Комментарий не может быть пустым');
      return;
    }

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
      message.success('Комментарий добавлен');
      onCommentsUpdate?.();
    } catch (error) {
      console.error('Error creating comment:', error);
      message.error('Не удалось добавить комментарий');
    }
  };

  const handleEditComment = async (commentId: number) => {
    if (!editText.trim()) {
      message.warning('Комментарий не может быть пустым');
      return;
    }

    try {
      const updatedComment = await commentsService.updateComment(commentId, { content: editText });
      setComments(comments.map(comment =>
        comment.id === commentId ? updatedComment : comment
      ));
      setEditingComment(null);
      setEditText('');
      message.success('Комментарий обновлен');
      onCommentsUpdate?.();
    } catch (error) {
      console.error('Error updating comment:', error);
      message.error('Не удалось обновить комментарий');
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    Modal.confirm({
      title: 'Удалить комментарий',
      content: 'Вы уверены, что хотите удалить этот комментарий? Это действие нельзя отменить.',
      icon: <ExclamationCircleOutlined />,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: async () => {
        try {
          await commentsService.deleteComment(commentId);
          setComments(comments.filter(comment => comment.id !== commentId));
          message.success('Комментарий удален');
          onCommentsUpdate?.();
        } catch (error) {
          console.error('Error deleting comment:', error);
          message.error('Не удалось удалить комментарий');
        }
      }
    });
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
    if (!currentUser || !comment.author) return false;
    if (comment.author.id === currentUser?.employeeId || currentUser.role !== UserRoleEnum.EMPLOYEE) {
      return true;
    }
    return false;
  };

  const handleDownload = async (filename: string) => {
    try {
      const response = await api.get(`/uploads/download/${filename}`, {
        responseType: 'blob'
      });

      const contentType = response.headers['content-type'] || 'application/octet-stream';

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

      const contentType = response.headers['content-type'] || 'application/octet-stream';

      const blob = new Blob([response.data], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

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

  if (loading) {
    return <div>Загрузка комментариев...</div>;
  }

  return (
    <div style={{ marginTop: 16 }}>
      <List
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} />}
              title={
                <Space>
                  <Text strong>
                    {`${comment.author?.firstName || 'Неизвестно'} ${comment.author?.lastName || ''}`}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {new Date(comment.created_at).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              }
              description={
                <div>
                  {editingComment === comment.id ? (
                    <div style={{ marginTop: 8 }}>
                      <Input.TextArea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        rows={3}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                      />
                      <div style={{ marginTop: 8 }}>
                        <Space size="small">
                          <Button
                            type="primary"
                            size="small"
                            icon={<SaveOutlined />}
                            onClick={() => handleEditComment(comment.id)}
                          >
                            Сохранить
                          </Button>
                          <Button
                            size="small"
                            icon={<CloseOutlined />}
                            onClick={cancelEditing}
                          >
                            Отмена
                          </Button>
                        </Space>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div>{comment.content}</div>

                      {/* Отображение вложений */}
                      {comment.attachments && comment.attachments.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <Text strong style={{ fontSize: '12px', color: '#666' }}>
                            Вложения:
                          </Text>
                          <div style={{ marginTop: 4 }}>
                            {comment.attachments.map((attachment: FileAttachment, index: number) => (
                              <div key={index} style={{
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
                        <div style={{ marginTop: 8 }}>
                          <Space size="small">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => startEditing(comment)}
                              title="Редактировать"
                            >
                              Редактировать
                            </Button>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleDeleteComment(comment.id)}
                              title="Удалить"
                            >
                              Удалить
                            </Button>
                          </Space>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              }
            />
          </List.Item>
        )}
      />

      {comments.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px 0' }}>
          Комментариев пока нет
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Input.TextArea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Добавить комментарий..."
          rows={3}
          autoSize={{ minRows: 2, maxRows: 6 }}
        />

        <div style={{ marginTop: 12, marginBottom: 12 }}>
          <SimpleFileUpload
            files={attachments}
            onFilesChange={setAttachments}
            maxFiles={3}
            maxSize={10 * 1024 * 1024}
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
          />
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddComment}
          disabled={!newComment.trim()}
          style={{ alignSelf: 'flex-end' }}
        >
          Добавить комментарий
        </Button>
      </div>
    </div>
  );
};

export default Comments;
