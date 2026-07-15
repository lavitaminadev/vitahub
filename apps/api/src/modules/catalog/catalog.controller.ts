import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './service.entity';
import { ServiceStatus } from './service-status.enum';

@Controller('catalog/services')
@UseGuards(AuthGuard('jwt'))
export class CatalogController {
  constructor(
    @InjectRepository(Service) private repo: Repository<Service>,
  ) {}

  @Get()
  list(@Req() req: any) {
    return this.repo.find({ where: { organizationId: req.organizationId, status: ServiceStatus.ACTIVE } as any, order: { name: 'ASC' } });
  }
}
