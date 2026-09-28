import querystring from 'querystring';
import { CompletedRequest, Mockttp } from 'mockttp';
import cache from '../../cache';
const workerThreads = require('node:worker_threads');

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request: CompletedRequest) => {
    const rawBody = request.body;

    const text = await rawBody.getText();

    const body = querystring.parse(text);

    const username = body.username as string;
    const redirectUri = body.redirect_uri as string;
    const state = body.state as string | undefined;
    const workerThread = workerThreads.threadId === 0 ? 0 : workerThreads.threadId - 1;
    cache.set(`email-${workerThread}`, username);

    const stateParam = state ? `&state=${state}` : '';
    const redirectUrl = `${redirectUri}?code=123${stateParam}`;

    return {
      statusCode: 302,
      headers: {
        location: redirectUrl
      }
    };
  });
}
