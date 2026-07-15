import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Create{{Entity}}UseCase } from '../use-cases/create-{{entity}}.use-case';
import { Create{{Entity}}Dto } from './create-{{entity}}.dto';

@Controller('{{pluralName}}')
@UseGuards(AuthGuard('jwt'))
export class {{Entity}}Controller {
  constructor(private readonly createUseCase: Create{{Entity}}UseCase) {}

  @Post()
  async create(@Body() dto: Create{{Entity}}Dto, @Req() req: any) {
    const result = await this.createUseCase.execute(dto, req.organizationId);
    return { data: result };
  }
}
