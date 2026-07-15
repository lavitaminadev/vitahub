import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenancyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const orgId = req.headers['x-organization-id'] as string;
    if (orgId) {
      (req as any).organizationId = orgId;
    } else if ((req as any).user?.organizationId) {
      (req as any).organizationId = (req as any).user.organizationId;
    }
    next();
  }
}
