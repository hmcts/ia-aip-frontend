import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
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
