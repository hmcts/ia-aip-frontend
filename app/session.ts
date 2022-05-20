import config from 'config';
import Logger, { getLogLabel } from './utils/logger';

const redis = require('redis');
const session = require('express-session');

const useRedis: boolean = config.get('session.useRedis') === true;
// RIA-5692 only for demo env revert once testing has completed
const isNotSecure: boolean = config.get('session.cookie.secure') === false;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function setupSession() {
  if (useRedis) {
    logger.trace(`connecting to reddis on [${config.get('session.redis.url')}]`, logLabel);
    let RedisStore = require('connect-redis')(session);
    const redisOpts = {
      url: config.get('session.redis.url'),
      ttl: config.get('session.redis.ttlInSeconds')
    };

    let client = redis.createClient(redisOpts);
    return session({
      cookie: {
        httpOnly: true,
        maxAge: config.get('session.cookie.maxAgeInMs'),
        secure: isNotSecure,
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
