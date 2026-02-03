import config from 'config';
import { createClient } from 'redis';
import Logger, { getLogLabel } from './utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export const redisClient = createClient({
  url: config.get('session.redis.url')
});

redisClient.on('error', err => {
  logger.exception(`Redis Client Error because of ${err.message}`, logLabel);
});
