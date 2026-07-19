import { IsString, IsOptional, IsUUID, IsDateString, IsNumber, MaxLength } from 'class-validator';

/**
 * DTO for creating an invoice.
 */
export class CreateInvoiceDto {
  /** Client id the invoice belongs to. */
  @IsUUID() clientId: string;
  /** Unique invoice number. */
  @IsString() @MaxLength(50) number: string;
  /** Issue date (ISO 8601). */
  @IsDateString() issuedAt: string;
  /** Due date (ISO 8601). */
  @IsDateString() dueAt: string;
  /** Subtotal amount. */
  @IsNumber() subtotal: number;
  /** Tax amount. */
  @IsOptional() @IsNumber() tax?: number;
  /** Total amount. */
  @IsNumber() total: number;
  /** ISO 4217 currency code. */
  @IsOptional() @IsString() @MaxLength(3) currency?: string;
  /** Optional notes. */
  @IsOptional() @IsString() notes?: string;
}
