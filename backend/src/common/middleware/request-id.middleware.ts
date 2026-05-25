import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export class RequestIdMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const id = String(req.headers['x-request-id'] ?? randomUUID());
    res.setHeader('x-request-id', id);
    (req as Request & { requestId?: string }).requestId = id;
    next();
  }
}
