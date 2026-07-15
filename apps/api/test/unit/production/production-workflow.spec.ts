import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PieceStatus } from '../../../src/modules/production/piece-status.enum';
import { CorrectionOrigin } from '../../../src/modules/production/correction-origin.enum';

const mockPieceRepo = {
  save: vi.fn(),
  manager: {
    transaction: vi.fn((cb: any) => cb({ save: vi.fn(), create: vi.fn(), findOne: vi.fn() })),
  },
};

const mockVersionRepo = {
  findOne: vi.fn(),
  create: vi.fn(),
  save: vi.fn(),
};

const mockCorrectionRepo = {
};

const mockDesignBudget = {
  calculateForPiece: vi.fn(),
  reserveForPiece: vi.fn(),
  confirmConsumption: vi.fn(),
};

const mockXp = {
  registerDelivery: vi.fn(),
  registerDesignerErrorPenalty: vi.fn(),
};

import { ProductionWorkflowService } from '../../../src/modules/production/production-workflow.service';

describe('ProductionWorkflowService', () => {
  let service: ProductionWorkflowService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new ProductionWorkflowService(
      mockPieceRepo as any,
      mockVersionRepo as any,
      mockCorrectionRepo as any,
      mockDesignBudget as any,
      mockXp as any,
    );
  });

  describe('submitVersion', () => {
    it('should create a piece version and update status to INTERNAL_REVIEW', async () => {
      const piece = { id: 'piece-1', status: PieceStatus.ASSIGNED };
      mockVersionRepo.findOne.mockResolvedValue(null);
      mockVersionRepo.create.mockReturnValue({
        pieceId: 'piece-1', versionNumber: 1, fileName: 'file.pdf',
        driveFileId: 'drive-123', createdBy: 'user-1',
      });
      mockVersionRepo.save.mockResolvedValue({
        id: 'version-1', versionNumber: 1, fileName: 'file.pdf',
        driveFileId: 'drive-123',
      });
      mockPieceRepo.save.mockResolvedValue({ ...piece, status: PieceStatus.INTERNAL_REVIEW });

      const result = await service.submitVersion(piece as any, 'file.pdf', 'drive-123', 'user-1');

      expect(result.versionNumber).toBe(1);
      expect(mockPieceRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: PieceStatus.INTERNAL_REVIEW }),
      );
    });
  });

  describe('rejectByClient', () => {
    it('should create a correction and set status to CORRECTION', async () => {
      const piece = { id: 'piece-1', clientCorrectionCount: 0, correctionCount: 0, status: PieceStatus.INTERNAL_REVIEW };
      const version = { id: 'version-1' };

      const mockManager = {
        create: vi.fn().mockReturnValue({ id: 'corr-1' }),
        save: vi.fn().mockResolvedValue({}),
      };
      mockPieceRepo.manager.transaction = vi.fn((cb: any) => cb(mockManager));

      await service.rejectByClient(piece as any, version as any, 'Needs changes', 'client-1');

      expect(piece.clientCorrectionCount).toBe(1);
      expect(piece.correctionCount).toBe(1);
      expect(piece.status).toBe(PieceStatus.CORRECTION);
      expect(mockManager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ origin: CorrectionOrigin.CLIENT_REQUEST, description: 'Needs changes' }),
      );
    });
  });

  describe('flagDesignerError', () => {
    it('should create a designer error correction and register penalty', async () => {
      const piece = { id: 'piece-1', correctionCount: 0, assignedTo: 'designer-1' };
      const version = { id: 'version-1' };

      const mockManager = {
        create: vi.fn().mockReturnValue({}),
        save: vi.fn().mockResolvedValue({}),
      };
      mockPieceRepo.manager.transaction = vi.fn((cb: any) => cb(mockManager));

      await service.flagDesignerError(piece as any, version as any, 'Wrong format', 'ad-1');

      expect(piece.correctionCount).toBe(1);
      expect(mockManager.create).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ origin: CorrectionOrigin.DESIGNER_ERROR, description: 'Wrong format' }),
      );
      expect(mockXp.registerDesignerErrorPenalty).toHaveBeenCalledWith(piece, 'designer-1');
    });
  });
});
