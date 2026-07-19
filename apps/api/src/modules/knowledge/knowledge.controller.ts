import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { KnowledgeStore } from './knowledge.store';
import { RagService } from './rag.service';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Knowledge')
@Controller('knowledge')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class KnowledgeController {
  constructor(
    private readonly store: KnowledgeStore,
    private readonly rag: RagService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los chunks de conocimiento' })
  list(@Req() req: AuthenticatedRequest) {
    return this.store.getByTenant(req.organizationId ?? req.user.tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas del knowledge base' })
  stats() {
    return this.rag.stats();
  }

  @Get('search')
  @ApiOperation({ summary: 'Búsqueda semántica en la base de conocimiento' })
  search(@Query('q') query: string, @Req() req: AuthenticatedRequest) {
    return this.rag.semanticSearch(req.organizationId ?? req.user.tenantId, query);
  }
}
