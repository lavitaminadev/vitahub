import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { Pack } from './pack.entity';
import { ServiceStatus } from './service-status.enum';
import { CreateServiceDto } from './dto/create-service.dto';
import { CreatePackDto } from './dto/create-pack.dto';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@Controller('catalog')
@UseGuards(AuthGuard('jwt'))
export class CatalogController {
  constructor(
    @InjectRepository(Service) private serviceRepo: Repository<Service>,
    @InjectRepository(Pack) private packRepo: Repository<Pack>,
  ) {}

  @Get('services')
  listServices(@Req() req: AuthenticatedRequest) {
    return this.serviceRepo.find({ where: { organizationId: req.organizationId, status: ServiceStatus.ACTIVE } as any, order: { name: 'ASC' } });
  }

  @Post('services')
  createService(@Body() dto: CreateServiceDto, @Req() req: AuthenticatedRequest) {
    return this.serviceRepo.save({ ...dto, organizationId: req.organizationId, status: ServiceStatus.ACTIVE });
  }

  @Put('services/:id')
  updateService(@Param('id') id: string, @Body() dto: CreateServiceDto, @Req() req: AuthenticatedRequest) {
    return this.serviceRepo.update({ id, organizationId: req.organizationId } as any, dto as any);
  }

  @Delete('services/:id')
  @Roles(UserRole.ADMIN)
  deleteService(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.serviceRepo.update({ id, organizationId: req.organizationId } as any, { status: ServiceStatus.ARCHIVED } as any);
  }

  @Get('packs')
  listPacks(@Req() req: AuthenticatedRequest) {
    return this.packRepo.find({ where: { organizationId: req.organizationId } as any, order: { createdAt: 'DESC' } });
  }

  @Post('packs')
  createPack(@Body() dto: CreatePackDto, @Req() req: AuthenticatedRequest) {
    return this.packRepo.save({ ...dto, organizationId: req.organizationId });
  }

  @Put('packs/:id')
  updatePack(@Param('id') id: string, @Body() dto: CreatePackDto, @Req() req: AuthenticatedRequest) {
    return this.packRepo.update({ id, organizationId: req.organizationId } as any, dto as any);
  }

  @Delete('packs/:id')
  @Roles(UserRole.ADMIN)
  deletePack(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.packRepo.delete({ id, organizationId: req.organizationId } as any);
  }
}
