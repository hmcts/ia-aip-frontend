import cache from 'memory-cache';
import { Mockttp } from 'mockttp';
import Logger, { getLogLabel } from '../../../../app/utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const test2 = await request.body.getJson() as { username?: string };
    logger.trace(test2.username, logLabel);
    if (test2.username) {
      logger.trace(test2.username, logLabel);
    } else {
      logger.trace('username not found', logLabel);
    }
    logger.trace(JSON.stringify(await request.body.getJson(), null, 2), logLabel);

    const body = await request.body.getJson() as any;
    const { username, state, redirect_uri } = body;
    cache.put('email', username);

    const stateParam = state ? `&state=${state}` : '';
    const redirectUrl = `${redirect_uri}?code=123${stateParam}`;

    return {
      status: 302,
      headers: {
        location: redirectUrl
      }
    };
  });
}
