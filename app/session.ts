import config from 'config';
import { RedisStore } from 'connect-redis';
import { createRedisClient } from './redisClient';
import Logger, { getLogLabel } from './utils/logger';

const session = require('express-session');

const useRedis: boolean = config.get('session.useRedis') === true;
const isSecure: boolean = config.get('session.cookie.secure') === true;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function setupSession() {
  const redisClient = createRedisClient();
  logger.trace(`connecting to redis on [${config.get('session.redis.url')}]`, logLabel);
  if (useRedis) {
    logger.trace(`connecting to redis on [${config.get('session.redis.url')}]`, logLabel);
    redisClient.connect().catch(err => {
      logger.exception('Error connecting to redis: ' + err.message, logLabel);
      throw err;
    });
    const redisStore = new RedisStore(
      { client: redisClient, ttl: config.get('session.redis.ttlInSeconds') }
    );
    return session({
      cookie: {
        httpOnly: true,
        maxAge: config.get('session.cookie.maxAgeInMs'),
        secure: isSecure,
        sameSite: 'lax'
      },
      resave: true,
      saveUninitialized: true,
      secret: config.get('session.redis.secret'),
      rolling: true,
      store: redisStore
    });
  } else {
    return session({
      secret: config.get('session.redis.secret'),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }
    });
  }
}

export {
  setupSession
};
