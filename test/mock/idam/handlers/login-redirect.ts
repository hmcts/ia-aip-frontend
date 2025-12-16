import cache from 'memory-cache';
import { Mockttp } from 'mockttp';
import Logger, { getLogLabel } from '../../../../app/utils/logger';

const logger: Logger = new Logger();
const logLabel: string = getLogLabel(__filename);

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const bodyJson = await request.body.getJson();
    const bodyText = await request.body.getText();
    const bodyFormData = await request.body.getFormData();
    logger.trace(bodyText, logLabel);
    logger.trace(JSON.stringify(bodyJson, null, 2), logLabel);
    for (let bodyFormDataKey in bodyFormData) {
      if (typeof bodyFormData[bodyFormDataKey] === 'string') {
        logger.trace(bodyFormData[bodyFormDataKey] as string, logLabel);
      } else {
        for (let filePart of bodyFormData[bodyFormDataKey] as string) {
          logger.trace(filePart, logLabel);
        }
      }
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
