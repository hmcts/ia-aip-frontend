import cache from 'memory-cache';
import { Mockttp } from 'mockttp';
import Logger, { getLogLabel } from '../../../../app/utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const test1 = await request.body.getText();
    const test2 = await request.body.getJson();
    const test3 = await request.body.getFormData();
    logger.trace(test1, logLabel);
    logger.trace(test2.toString(), logLabel);
    for (let test3Key in test3) {
      logger.trace(test3[test3Key].toString(), logLabel);
    }
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
