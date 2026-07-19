import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Facturación')
@Controller('billing/invoices')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BillingController {
  constructor(
    @InjectRepository(Invoice) private repo: Repository<Invoice>,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear factura' })
  create(@Body() dto: any, @Req() req: AuthenticatedRequest) {
    return this.repo.save({ ...dto, organizationId: req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar facturas' })
  list(@Req() req: AuthenticatedRequest) {
    return this.repo.find({ where: { organizationId: req.organizationId }, order: { issuedAt: 'DESC' } });
  }
}
