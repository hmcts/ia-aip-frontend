import { Request } from 'express';
import Logger, { getLogLabel } from '../utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export default class IdamService {
  getUserToken(req: Request) {
    const authToken = req.cookies?.['__auth-token'];
    if (!authToken) {
      logger.exception(`Auth token cookie is missing or undefined. Cookies present: ${Object.keys(req.cookies || {}).join(', ')}`, logLabel);
    } else if (typeof authToken === 'string') {
      // Log token info for debugging (first 10 chars only for security)
      const tokenPreview = authToken.substring(0, 10);
      logger.trace(`Auth token retrieved: length=${authToken.length}, preview=${tokenPreview}...`, logLabel);
    }
    return `Bearer ${authToken}`;
  }
}
