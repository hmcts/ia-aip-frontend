import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import RedisStore, { RedisReply } from 'rate-limit-redis';
import { redisClient } from '../redis/client';

export const keyGenerator = (req: any) => {
  if (req?.idam?.userDetails?.uid) {
    return `rl:uid:${req.idam.userDetails.uid}`;
  } else if (req?.ip) {
    return `rl:${ipKeyGenerator(req.ip)}`;
  } else {
    throw new Error('Unable to generate key for rate limiting: missing user ID and IP address');
  }
};

export const skip = (req: any) => {
  const roles: string[] = req?.idam?.userDetails?.roles || [];
  return !(roles.length === 0 || roles.includes('citizen'));
};

export const sendCommand = (...args: string[]): Promise<RedisReply> => {
  return new Promise<RedisReply>((resolve, reject) => {
    redisClient.send_command(args[0], args.slice(1), (err: Error, reply) => {
      if (err) {
        reject(err);
      } else {
        resolve(reply);
      }
    });
  });
};

export const citizenLimiter = rateLimit({
  windowMs: 60 * 1000 * 30,
  limit: 5,

  store: new RedisStore({
    sendCommand
  }),

  keyGenerator,
  skip,

  standardHeaders: true,
  legacyHeaders: false
});
