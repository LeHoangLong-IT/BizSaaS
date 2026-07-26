import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export interface TenantRequest extends Request {
  tenantId?: string;
}

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: TenantRequest, res: Response, next: NextFunction) {
    const tenantId = req.headers['x-tenant-id'] as string;
    
    // Trong môi trường production thực tế, Subdomain có thể được map sang tenantId ở Nginx hoặc Next.js Middleware.
    // Ở đây ta hứng header 'x-tenant-id' truyền xuống từ Frontend.
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-ID header is missing. Cannot determine tenant context.');
    }

    req.tenantId = tenantId;
    next();
  }
}
