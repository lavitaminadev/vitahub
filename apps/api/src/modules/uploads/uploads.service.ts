import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Upload } from './upload.entity';

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(Upload) private repo: Repository<Upload>,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async upload(
    file: Express.Multer.File,
    organizationId: string,
    uploadedBy: string,
  ): Promise<Upload> {
    const ext = path.extname(file.originalname);
    const fileName = `${uuidv4()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    fs.writeFileSync(filePath, file.buffer);

    const upload = this.repo.create({
      organizationId,
      fileName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath,
      uploadedBy,
    });
    return this.repo.save(upload);
  }

  async getFile(id: string): Promise<Upload> {
    const upload = await this.repo.findOne({ where: { id } });
    if (!upload) throw new NotFoundException('File not found');
    return upload;
  }

  async delete(id: string): Promise<void> {
    const upload = await this.getFile(id);
    if (fs.existsSync(upload.path)) {
      fs.unlinkSync(upload.path);
    }
    await this.repo.remove(upload);
  }

  async syncToDrive(id: string): Promise<void> {
    const upload = await this.getFile(id);
    // TODO: Implement Google Drive upload
    // const driveService = new google.drive.Drive({...});
    // const response = await driveService.files.create({...});
    // upload.driveFileId = response.data.id;
    // await this.repo.save(upload);
  }
}
