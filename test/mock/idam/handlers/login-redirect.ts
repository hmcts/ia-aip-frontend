import cache from 'memory-cache';
import { Mockttp } from 'mockttp';
import Logger, { getLogLabel } from '../../../../app/utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const bodyFormData = await request.body.getFormData();
    const username = bodyFormData['body'] as string;
    const state = bodyFormData['state'] as string;
    const redirectUri = bodyFormData['redirect_uri'] as string;
    for (let bodyFormDataKey in bodyFormData) {
      if (typeof bodyFormData[bodyFormDataKey] === 'string') {
        logger.trace('key: ' + bodyFormDataKey, logLabel);
        logger.trace('value: ' + bodyFormData[bodyFormDataKey] as string, logLabel);
      }
    }
    cache.put('email', username);

    const stateParam = state ? `&state=${state}` : '';
    const redirectUrl = `${redirectUri}?code=123${stateParam}`;

    return {
      status: 302,
      headers: {
        location: redirectUrl
      }
    };
  });
}
