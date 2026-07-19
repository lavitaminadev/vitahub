import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMeetingUseCase } from './create-meeting.use-case';
import { ListMeetingsUseCase } from './list-meetings.use-case';
import { Meeting } from './meeting.entity';
import { ActionItem } from './action-item.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { MeetingType } from './meeting-type.enum';
import { ActionItemStatus } from './action-item-status.enum';
import { Roles } from '../../core/authorization/roles.decorator';
import { UserRole } from '../organizations/user-role.enum';
import type { AuthenticatedRequest } from '@shared/types/request';

@ApiTags('Reuniones')
@Controller('meetings')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class MeetingsController {
  constructor(
    @InjectRepository(Meeting) private repo: Repository<Meeting>,
    @InjectRepository(ActionItem) private actionItemRepo: Repository<ActionItem>,
    private createMeeting: CreateMeetingUseCase,
    private listMeetings: ListMeetingsUseCase,
  ) {}

  @Post()
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva reunion' })
  create(@Body() dto: CreateMeetingDto, @Req() req: AuthenticatedRequest) {
    return this.createMeeting.execute({
      ...dto,
      organizationId: req.organizationId,
      createdBy: req.user.id,
      type: dto.type || MeetingType.WEEKLY,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : new Date(),
    });
  }

  @Get()
  @ApiOperation({ summary: 'Listar reuniones' })
  async list(@Query('type') type: string, @Req() req: AuthenticatedRequest) {
    const clientId = req.user?.role === 'client' ? req.user.clientId : undefined;
    const meetings = await this.listMeetings.execute(req.organizationId, type, clientId);
    return Promise.all(meetings.map(async (meeting) => {
      const actionItems = await this.actionItemRepo.find({
        where: { meetingId: meeting.id },
        order: { createdAt: 'ASC' },
      });
      return { ...meeting, actionItems };
    }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una reunion' })
  async getOne(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const meeting = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    const actionItems = await this.actionItemRepo.find({ where: { meetingId: id }, order: { createdAt: 'ASC' } });
    return { ...meeting, actionItems };
  }

  @Put(':id')
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Actualizar una reunion' })
  async update(@Param('id') id: string, @Body() dto: Partial<CreateMeetingDto>, @Req() req: AuthenticatedRequest) {
    const meeting = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    Object.assign(meeting, dto);
    return this.repo.save(meeting);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Eliminar una reunion' })
  async remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const meeting = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.repo.remove(meeting);
  }

  @Post(':id/action-items')
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Crear compromiso de reunion' })
  async createActionItem(@Param('id') id: string, @Body() dto: CreateActionItemDto, @Req() req: AuthenticatedRequest) {
    const meeting = await this.repo.findOne({ where: { id, organizationId: req.organizationId } });
    if (!meeting) throw new NotFoundException('Meeting not found');
    return this.actionItemRepo.save(this.actionItemRepo.create({
      meetingId: id,
      description: dto.description.trim(),
      assignedTo: dto.assignedTo,
      dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
      status: ActionItemStatus.PENDING,
    }));
  }

  @Put('action-items/:actionItemId')
  @Roles(UserRole.COMMUNITY_MANAGER, UserRole.OPERATIONS_DIRECTOR, UserRole.ADMIN, UserRole.CLIENT)
  @ApiOperation({ summary: 'Actualizar compromiso de reunion' })
  async updateActionItem(@Param('actionItemId') actionItemId: string, @Body() dto: UpdateActionItemDto, @Req() req: AuthenticatedRequest) {
    const actionItem = await this.actionItemRepo.findOne({
      where: { id: actionItemId },
      relations: ['meeting'],
    });
    if (!actionItem || actionItem.meeting.organizationId !== req.organizationId) throw new NotFoundException('Action item not found');
    if (req.user.role === UserRole.CLIENT && req.user.clientId !== actionItem.meeting.clientId) {
      throw new NotFoundException('Action item not found');
    }
    if (dto.description != null) actionItem.description = dto.description.trim();
    if (dto.assignedTo !== undefined) actionItem.assignedTo = dto.assignedTo;
    if (dto.dueAt !== undefined) actionItem.dueAt = dto.dueAt ? new Date(dto.dueAt) : undefined;
    if (dto.status) {
      actionItem.status = dto.status as ActionItemStatus;
      actionItem.completedAt = dto.status === ActionItemStatus.COMPLETED ? new Date() : undefined;
    }
    return this.actionItemRepo.save(actionItem);
  }
}
