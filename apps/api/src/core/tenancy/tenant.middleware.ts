import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { tenantContext } from './tenant-context';

const PUBLIC_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh', '/health'];

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const isPublic = PUBLIC_ROUTES.some(route => req.path.startsWith(route));
    if (isPublic) {
      return next();
    }

    const orgId =
      (req.headers['x-organization-id'] as string) ||
      (req as any).user?.organizationId;

    if (orgId) {
      (req as any).organizationId = orgId;
      return tenantContext.run({ organizationId: orgId }, () => next());
    }

    next();
  }
}
