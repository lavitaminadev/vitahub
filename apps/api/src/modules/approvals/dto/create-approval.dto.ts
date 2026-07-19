import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

/**
 * DTO for creating an approval request.
 */
export class CreateApprovalDto {
  /** Title of the approval request. */
  @IsString() @MaxLength(255) title: string;
  /** Optional description. */
  @IsOptional() @IsString() description?: string;
  /** Type of entity being approved (e.g. piece, content_grid). */
  @IsString() @MaxLength(100) entityType: string;
  /** Id of the entity being approved. */
  @IsUUID() entityId: string;
  /** Optional client id. */
  @IsOptional() @IsUUID() clientId?: string;
  /** Optional user id assigned to review. */
  @IsOptional() @IsUUID() assignedTo?: string;
}
