import { IsString, IsOptional, IsUUID, IsDateString, IsEnum, MaxLength, IsNumber } from 'class-validator';
import { MeetingType } from '../meeting-type.enum';

export class CreateMeetingDto {
  @IsOptional() @IsUUID() clientId?: string;
  @IsString() @MaxLength(255) title: string;
  @IsOptional() @IsEnum(MeetingType) type?: MeetingType;
  @IsOptional() @IsDateString() scheduledAt?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsNumber() durationMinutes?: number;
  @IsOptional() @IsString() @MaxLength(255) location?: string;
  @IsOptional() @IsString() @MaxLength(255) meetingLink?: string;
}
