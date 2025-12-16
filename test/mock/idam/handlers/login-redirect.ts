import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request) => {
    const bodyFormData = await request.body.getFormData();
    const username = bodyFormData['body'] as string;
    const state = bodyFormData['state'] as string;
    const redirectUri = bodyFormData['redirect_uri'] as string;
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
