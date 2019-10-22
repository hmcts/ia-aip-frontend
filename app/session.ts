import config from 'config';
import redisConnect from 'connect-redis';
import express from 'express';
import expressSession from 'express-session';
import * as redis from 'redis';

const useRedis = config.get('session.useRedis') === 'true';
const isSecure = config.get('session.cookie.secure') === 'true';

function setupSession(): express.RequestHandler {
  if (useRedis) {
    const redisStore: redisConnect.RedisStore = redisConnect(expressSession);
    const redisClient = redis.createClient();

    redisClient.on('error', (err) => {
      // tslint:disable-next-line no-console
      console.log('Redis error: ', err);
    });
    const store = new redisStore({
      url: config.get('session.redis.url'),
      ttl: config.get('session.redis.ttlInSeconds'),
      client: redisClient
    });
    return expressSession({
      cookie: {
        httpOnly: true,
        maxAge: config.get('session.cookie.maxAgeInMs'),
        secure: isSecure
      },
      resave: true,
      saveUninitialized: true,
      secret: config.get('session.redis.secret'),
      rolling: true,
      store
    });
  } else {
    return expressSession({
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
