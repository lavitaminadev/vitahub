import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

const SUPER_ADMIN_ROLES = ['super_admin', 'admin'];

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = (req as any).user;
    const orgId = (req as any).organizationId;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (SUPER_ADMIN_ROLES.includes(user.role)) {
      return true;
    }

    const effectiveOrgId = orgId || user.organizationId;

    if (user.organizationId !== effectiveOrgId) {
      throw new ForbiddenException('Organization access denied');
    }

    return true;
  }
}
