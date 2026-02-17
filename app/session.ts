import config from 'config';
import Logger, { getLogLabel } from './utils/logger';

const session = require('express-session');
const redis = require('redis');

const useRedis: boolean = config.get('session.useRedis') === true;
const isSecure: boolean = config.get('session.cookie.secure') === true;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function setupSession() {
  logger.trace(`connecting to reddis on [${config.get('session.redis.url')}]`, logLabel);
  if (useRedis) {
    logger.trace(`connecting to reddis on [${config.get('session.redis.url')}]`, logLabel);
    const RedisStore = require('connect-redis')(session);
    const redisOpts = {
      legacyMode: true,
      url: config.get('session.redis.url'),
      ttl: config.get('session.redis.ttlInSeconds')
    };

    const client = redis.createClient(redisOpts);
    client.connect()
      .then(() => logger.trace(`Connected to Redis at [${config.get('session.redis.url')}]`, logLabel))
      .catch(err => {
        logger.exception(`Redis connection error: ${err}`, logLabel);
        throw err;
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
      store: new RedisStore({ client })
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
