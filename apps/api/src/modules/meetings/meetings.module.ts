import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meeting } from './meeting.entity';
import { ActionItem } from './action-item.entity';
import { MeetingsController } from './meetings.controller';
import { CreateMeetingUseCase } from './create-meeting.use-case';
import { ListMeetingsUseCase } from './list-meetings.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Meeting, ActionItem])],
  controllers: [MeetingsController],
  providers: [CreateMeetingUseCase, ListMeetingsUseCase],
})
export class MeetingsModule {}
