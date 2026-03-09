import config from 'config';
const redis = require('redis');

export const redisClient = redis.createClient({
  url: config.get('session.redis.url'),
  ttl: config.get('session.redis.ttlInSeconds')
});
