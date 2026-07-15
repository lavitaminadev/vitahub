import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './invoice.entity';

@ApiTags('Facturación')
@Controller('billing/invoices')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BillingController {
  constructor(
    @InjectRepository(Invoice) private repo: Repository<Invoice>,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar facturas' })
  list(@Req() req: any) {
    return this.repo.find({ where: { organizationId: req.organizationId }, order: { issuedAt: 'DESC' } });
  }
}
