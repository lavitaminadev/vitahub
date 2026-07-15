import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateMeetingUseCase } from './create-meeting.use-case';
import { ListMeetingsUseCase } from './list-meetings.use-case';

@ApiTags('Reuniones')
@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MeetingsController {
  constructor(
    private createMeeting: CreateMeetingUseCase,
    private listMeetings: ListMeetingsUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear una nueva reunión' })
  create(@Body() dto: any, @Req() req: any) {
    return this.createMeeting.execute({ ...dto, organizationId: req.organizationId, createdBy: req.user.id });
  }

  @Get()
  @ApiOperation({ summary: 'Listar reuniones' })
  list(@Query('type') type: string, @Req() req: any) {
    return this.listMeetings.execute(req.organizationId, type);
  }
}
