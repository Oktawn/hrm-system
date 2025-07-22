import { drive_v3, google } from "googleapis";
import { apiGoogle } from "./api";
import { envConfig } from "../config/config";


export class GoogleDrive {
  private drive: drive_v3.Drive;
  constructor() {
    this.drive = google.drive({
      version: "v3",
      auth: apiGoogle
    });
  }

  async getListFiles() {
    const files = [];
    let pageToken: string | undefined = undefined;

    do {
      const res = await this.drive.files.list({
        pageSize: 1000,
        fields: "nextPageToken, files(id, name, mimeType, parents, size)",
        pageToken,
      });
      if (res.data.files) {
        files.push(...res.data.files);
      }
      pageToken = res.data.nextPageToken || undefined;
    } while (pageToken);

    return files;
  }

  async uploadFile(name: string, mimeType: string, data: any) {
    const res = await this.drive.files.create({
      fields: "id",
      media: {
        mimeType: mimeType,
        body: data
      },
      requestBody: {
        name: name,
      }
    });

    const fileId = res.data.id;
    if (fileId) {
      try {
        await this.drive.permissions.create({
          fileId,
          requestBody: {
            role: "reader",
            type: "anyone"
          }
        });
      } catch (permissionError) {
        console.warn('Не удалось установить публичные разрешения для файла:', permissionError.message);
      }
    }

    return fileId;
  }


  async downloadFile(fileId: string) {
    const res = await this.drive.files.get({
      fileId: fileId,
      alt: "media",
    }, {
      responseType: "stream"
    });

    return res.data;
  }

  async getFileMetadata(fileId: string) {
    const res = await this.drive.files.get({
      fileId,
      fields: "id, name, mimeType, size"
    });
    return res.data;
  }


  async downloadFileToResponse(fileId: string, response: any, fileName?: string) {
    const fileMetadata = await this.drive.files.get({
      fileId,
      fields: "name, mimeType"
    });

    const fileStream = await this.drive.files.get({
      fileId,
      alt: "media",
    }, {
      responseType: "stream"
    });

    const displayName = fileName || fileMetadata.data.name || "download";
    const mimeType = fileMetadata.data.mimeType || "application/octet-stream";

    response.setHeader("Content-Disposition", `attachment; filename="${displayName}"`);
    response.setHeader("Content-Type", mimeType);

    fileStream.data.pipe(response);
  }

}