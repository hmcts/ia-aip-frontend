import config from 'config';
import { RedisStore} from 'connect-redis';
import { redisClient } from './redis/client';
import Logger, { getLogLabel } from './utils/logger';


const session = require('express-session');

const useRedis: boolean = config.get('session.useRedis') === true;
const isSecure: boolean = config.get('session.cookie.secure') === true;

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

function setupSession() {
  logger.trace(`connecting to reddis on [${config.get('session.redis.url')}]`, logLabel);
  if (useRedis) {
    logger.trace(`connecting to reddis on ['${config.get('session.redis.url')}]`, logLabel);

    return session({
      cookie: {
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax'
      },
      resave: true,
      saveUninitialized: true,
      secret: config.get('session.redis.secret'),
      rolling: true,
      store: new RedisStore({ client: redisClient, ttl: config.get<number> ('session.cookie.maxAgeInMs')/1000})
    });
  } else {
    return session({
      secret: config.get('session.redis.secret'),
      resave: false,
      saveUninitialized: true,
      cookie: { httpOnly: true, secure: isSecure, sameSite: 'lax' }
    });
  }
}

export {
  setupSession
};
