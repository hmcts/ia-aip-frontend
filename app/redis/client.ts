import config from 'config';
import {createClient} from 'redis';
import Logger, {getLogLabel} from '../utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const useRedis: boolean = config.get('session.useRedis') === true;

//TLS requires this in new redis version
function toNewRedisUrl(url:string):string{
    logger.trace('REDIS URL: ' + url, logLabel);
    if(!/[?&]tls=true\b/.test(url)) return url;
    return url
        .replace(/^redis:/, 'rediss:')
        .replace(/([?&])tls=true&?/,'$1')
        .replace(/[?&]$/,'');
}

function createRedisClient(url:string, factory=createClient){
    const newUrl = toNewRedisUrl(url);
    logger.trace('new redis url: ' + newUrl, logLabel);
    const client=factory({url: newUrl});
    client.on('error',(err: Error)=> logger.exception(`Error starting Redis client:${err.message}`, logLabel));
    client.connect()
      .then(()=>logger.trace('Connected to Redis client',logLabel))
      .catch((err:Error) => logger.exception(`Cannot connect to Redis client: ${err.message}`, logLabel ));
    return client;

}
const redisClient= useRedis ? createRedisClient(config.get<string>('session.redis.url')) : undefined;

export {
    redisClient,
    createRedisClient,
    toNewRedisUrl,
};