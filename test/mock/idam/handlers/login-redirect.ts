import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const rawBody = request.body?.toString() ?? '{}';
    const body = JSON.parse(rawBody);

    const username = body.body;
    const state = body.state;
    const redirectUri = body.redirect_uri;

    cache.put('email', username);

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
