import {
  Controller, Get, Post, Delete, Param, UseInterceptors,
  UploadedFile, Req, NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { AuthenticatedRequest } from '@shared/types/request';
import { UploadsService } from './uploads.service';

@ApiTags('Archivos')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly service: UploadsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir un archivo' })
  @ApiBody({ description: 'Archivo a subir (multipart/form-data)' })
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: AuthenticatedRequest) {
    const organizationId = req.body?.organizationId ?? req.headers['x-org-id'] as string;
    const uploadedBy = req.user?.id ?? req.headers['x-user-id'] as string;
    return this.service.upload(file, organizationId, uploadedBy);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener metadatos de un archivo' })
  async getMetadata(@Param('id') id: string) {
    return this.service.getFile(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un archivo' })
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return { deleted: true };
  }
}
