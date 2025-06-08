import React, { useState, useEffect } from 'react';
import { commentsService, type IComment, type ICreateComment } from '../../services/comments.service';
import { useAuthStore } from '../../stores/auth.store';
import './Comments.css';

interface CommentsProps {
  type: 'task' | 'request';
  itemId: number;
  isVisible: boolean;
  onClose: () => void;
}

const Comments: React.FC<CommentsProps> = ({ type, itemId, isVisible, onClose }) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    if (isVisible) {
      fetchComments();
    }
  }, [isVisible, itemId, type]);

  const fetchComments = async () => {
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
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData: ICreateComment = {
        content: newComment,
        type,
        ...(type === 'task' ? { taskId: itemId } : { requestId: itemId })
      };

      const createdComment = await commentsService.createComment(commentData);
      setComments([...comments, createdComment]);
      setNewComment('');
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
