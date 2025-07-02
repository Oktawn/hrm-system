import { Upload, Button, List, Typography, message } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';

const { Text } = Typography;

interface SimpleFileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
}

export function SimpleFileUpload({
  files,
  onFilesChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt'
}: SimpleFileUploadProps) {
  const uploadProps: UploadProps = {
    name: 'files',
    multiple: true,
    maxCount: maxFiles,
    accept,
    beforeUpload: (file: File) => {
      if (file.size > maxSize) {
        const maxSizeMB = Math.round(maxSize / (1024 * 1024));
        message.error(`Файл "${file.name}" слишком большой. Максимальный размер: ${maxSizeMB}MB`);
        return false;
      }

      if (files.length >= maxFiles) {
        message.error(`Максимальное количество файлов: ${maxFiles}`);
        return false;
      }

      const newFiles = [...files, file];
      onFilesChange(newFiles);

      return false;
    },
    fileList: [],
    showUploadList: false,
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <Upload {...uploadProps}>
        <Button
          icon={<UploadOutlined />}
          disabled={files.length >= maxFiles}
        >
          Выбрать файлы ({files.length}/{maxFiles})
        </Button>
      </Upload>

      {files.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <List
            size="small"
            dataSource={files}
            renderItem={(file, index) => (
              <List.Item
                actions={[
                  <Button
                    key="delete"
                    type="text"
                    size="small"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveFile(index)}
                    title="Удалить"
                  />
                ]}
              >
                <List.Item.Meta
                  title={file.name}
                  description={
                    <Text type="secondary">
                      {formatFileSize(file.size)}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </div>
  );
};

export default SimpleFileUpload;
