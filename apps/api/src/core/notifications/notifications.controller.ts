import { Controller, Get, Put, Param, Req, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationService } from './notification.service';

@ApiTags('Notificaciones')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del usuario' })
  async findAll(@Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] as string;
    return this.service.findByUser(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Obtener cantidad de notificaciones no leídas' })
  async unreadCount(@Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] as string;
    const count = await this.service.unreadCount(userId);
    return { unread: count };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id ?? req.headers['x-user-id'] as string;
    const notif = await this.service.markAsRead(id, userId);
    if (!notif) throw new NotFoundException('Notification not found');
    return notif;
  }
}
