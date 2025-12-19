import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const rawBody = request.body?.toString() ?? '{}';
    // tslint:disable-next-line:no-console
    console.log('body: ' + rawBody);
    const body = JSON.parse(rawBody);

    cache.put('email', body.username);

    const stateParam = body.state ? `&state=${body.state}` : '';
    const redirectUrl = `${body.redirect_uri}?code=123${stateParam}`;

    return {
      statusCode: 302,
      headers: {
        location: redirectUrl
      }
    };
  });
}
