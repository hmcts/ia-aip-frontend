import cache from 'memory-cache';
import { CompletedBody, CompletedRequest, Mockttp } from 'mockttp';

export async function setupLoginRedirect(server: Mockttp) {
  await server.forPost('/login').thenCallback(async (request: CompletedRequest) => {
    const rawBody: CompletedBody = request.body;
    // tslint:disable:no-console
    console.log('rawBody: ' + rawBody);
    const json = await rawBody.getJson();
    console.log('json: ' + json);
    const body = JSON.parse(json.toString());
    console.log('body: ' + JSON.stringify(body));
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
