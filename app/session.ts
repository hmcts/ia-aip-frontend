import config from 'config';
import Logger, { getLogLabel } from './utils/logger';

const redis = require('redis');
const session = require('express-session');
const RedisStore = require('connect-redis').RedisStore;

const useRedis: boolean = config.get('session.useRedis') === true;
const isSecure: boolean = config.get('session.cookie.secure') === true;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function setupSession() {
  logger.trace(`connecting to redis on [${config.get('session.redis.url')}]`, logLabel);
  if (useRedis) {
    logger.trace(`connecting to redis on [${config.get('session.redis.url')}]`, logLabel);

    const redisOpts = {
      url: config.get('session.redis.url')
    };

    let client = redis.createClient(redisOpts);

    client.connect().catch((err: any) => {
      logger.trace(`error connecting to redis: ${err}`, logLabel);
    });

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
      store: new RedisStore({
        client: client,
        ttl: config.get('session.redis.ttlInSeconds')
      })
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
