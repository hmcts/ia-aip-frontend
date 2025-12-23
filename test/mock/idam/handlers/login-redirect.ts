import cache from 'memory-cache';
import { CompletedRequest, Mockttp } from 'mockttp';
import querystring from 'querystring';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').always().thenCallback(async (request: CompletedRequest) => {
    const rawBody = request.body;

    const text = await rawBody.getText();

    const body = querystring.parse(text);

    const username = body.username as string;
    const redirectUri = body.redirect_uri as string;
    const state = body.state as string | undefined;
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
