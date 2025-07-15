import React, { useState } from 'react';
import { Upload, Button, List, Typography, message } from 'antd';
import { UploadOutlined, DeleteOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { api } from '../../services/auth.service';
import type { FileUploadProps } from '../../types/document.types';

const { Text } = Typography;

export const FileUpload: React.FC<FileUploadProps> = ({
  value = [],
  onChange,
  maxFiles = 5,
  disabled = false,
  showDownload = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const uploadProps: UploadProps = {
    name: 'files',
    multiple: true,
    maxCount: maxFiles,
    fileList,
    beforeUpload: () => false,
    onChange: (info) => {
      setFileList(info.fileList);
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
    },
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Выберите файлы для загрузки');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });

    try {
      setUploading(true);
      const response = await api.post('/uploads/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const newAttachments = [...value, ...response.data.data];
        onChange?.(newAttachments);
        setFileList([]);
        message.success('Файлы успешно загружены');
      }
    } catch (error: any) {
      console.error('Ошибка загрузки файлов:', error);
      message.error(error.response?.data?.message || 'Ошибка загрузки файлов');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (filename: string) => {
    const newAttachments = value.filter(att => att.filename !== filename);
    onChange?.(newAttachments);
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

  return (
    <div>
      {!disabled && (
        <div style={{ marginBottom: 16 }}>
          <Upload {...uploadProps}>
            <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
          </Upload>
          {fileList.length > 0 && (
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              style={{ marginTop: 8 }}
            >
              Загрузить ({fileList.length})
            </Button>
          )}
        </div>
      )}

      {value.length > 0 && (
        <List
          size="small"
          dataSource={value}
          renderItem={(attachment) => (
            <List.Item
              actions={[
                ...(isImage(attachment.mimetype) ? [
                  <Button
                    key="view"
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleView(attachment.filename)}
                    title="Просмотр"
                  />
                ] : []),
                ...(showDownload ? [
                  <Button
                    key="download"
                    type="text"
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(attachment.filename)}
                    title="Скачать"
                  />
                ] : []),
                ...(!disabled ? [
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveAttachment(attachment.filename)}
                    title="Удалить"
                  />
                ] : [])
              ]}
            >
              <List.Item.Meta
                title={attachment.originalName}
                description={
                  <Text type="secondary">
                    {formatFileSize(attachment.size)} • {new Date(attachment.uploadDate).toLocaleString()}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default FileUpload;
