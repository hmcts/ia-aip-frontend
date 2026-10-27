import config from 'config';
import {createClient} from 'redis';
import Logger, {getLogLabel} from '../utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);
const useRedis: boolean = config.get('session.useRedis') === true;

//TLS requires this in new redis version
function toNewRedisUrl(url:string):string{
    const parsed = new URL(url);
    parsed.password = parsed.username;
    parsed.username = '';
    if (parsed.searchParams.get('tls')==='true'){
        parsed.protocol='rediss:';
        parsed.searchParams.delete('tls');
    }

    logger.trace('REDIS URL: ' + url, logLabel);
    logger.trace('REDIS PARSED: ' + parsed.toString(), logLabel);
    return parsed.toString();
}

function createRedisClient(url:string, factory=createClient){
    const client=factory({url: toNewRedisUrl(url)});
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