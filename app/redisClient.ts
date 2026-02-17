import config from 'config';
import { createClient, RedisClientType } from 'redis';
import Logger, { getLogLabel } from './utils/logger';

export function createRedisClient(): RedisClientType {
  const logger = new Logger();
  const logLabel = getLogLabel(__filename);

  const client: RedisClientType = createClient({
    url: config.get('session.redis.url')
  });

  client.on('error', err => {
    logger.exception(`Redis Client Error because of ${err.message}`, logLabel);
  });

  return client;
}
