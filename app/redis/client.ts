import config from 'config';
const redis = require('redis');
const useRedis: boolean = config.get('session.useRedis') === true;

export const redisClient = useRedis ? redis.createClient({
  url: config.get('session.redis.url'),
  ttl: config.get('session.redis.ttlInSeconds')
}) : { send_command: async () => {} };
