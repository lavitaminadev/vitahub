import { IsString, IsUUID, IsEnum } from 'class-validator';
import { CorrectionOrigin } from '../correction-origin.enum';

export class RejectPieceDto {
  @IsUUID() versionId: string;
  @IsString() comment: string;
  @IsEnum(CorrectionOrigin) origin: CorrectionOrigin;
}
