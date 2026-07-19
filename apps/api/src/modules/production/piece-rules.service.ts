import { Injectable } from '@nestjs/common';

@Injectable()
export class PieceRulesService {
  MAX_CORRECTIONS = 3;

  canRequestCorrection(currentCount: number, isDesignerError: boolean): { allowed: boolean; reason?: string } {
    if (!isDesignerError && currentCount >= this.MAX_CORRECTIONS) {
      return { allowed: false, reason: `Límite de ${this.MAX_CORRECTIONS} correcciones alcanzado. La siguiente corrección generará nota de cobro.` };
    }
    return { allowed: true };
  }

  shouldGenerateInvoice(clientCorrectionCount: number): boolean {
    return clientCorrectionCount > this.MAX_CORRECTIONS;
  }
}
