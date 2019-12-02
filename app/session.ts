import config from 'config';
const redis = require('redis');
const session = require('express-session');

const useRedis = config.get('session.useRedis') === 'true';
const isSecure = config.get('session.cookie.secure') === 'true';

function setupSession() {
  if (useRedis) {
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
        secure: isSecure
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
