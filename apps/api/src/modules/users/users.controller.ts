import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserUseCase } from './create-user.use-case';
import { ListUsersUseCase } from './list-users.use-case';

@ApiTags('Usuarios')
@Controller('users')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class UsersController {
  constructor(
    private createUser: CreateUserUseCase,
    private listUsers: ListUsersUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo usuario' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createUser.execute({ ...dto, organizationId: dto.organizationId || req.organizationId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuarios' })
  list(@Query('organizationId') organizationId: string, @Req() req: any) {
    return this.listUsers.execute(organizationId || req.organizationId);
  }
}
