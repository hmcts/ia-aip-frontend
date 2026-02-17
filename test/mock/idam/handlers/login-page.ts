import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

const skipLogin = process.env.SKIP_LOGIN === 'true';

export async function setupLoginPage(server: Mockttp) {
  await server.forGet('/login').thenCallback(async (request) => {
    const url = new URL(request.url, 'http://localhost');
    const redirectUri = url.searchParams.get('redirect_uri') ?? '';
    const stateParam = url.searchParams.get('state') ?? '';

    if (skipLogin) {
      cache.put('email', 'skipped_login@hmcts.net');
      return {
        statusCode: 302,
        headers: {
          location: `${redirectUri}?code=123${stateParam}`
        }
      };
    } else {
      const html = `
            <html><head>
            <title>Sign in - HMCTS Access</title>
            </head><body>
            <h1>Sign in - HMCTS Access</h1>
            <form action="/login" method="post">
            Username: <input type="text" id="username" name="username"/><br />
            Password: <input type="text" id="password" name="password"/><br />
            <input type="text" name="redirect_uri" value="${redirectUri}"/>
            <input type="text" name="state" value="${stateParam}"/>
            <input id="login" class="button" type="submit" name="save" id="login" value="Sign in"/>
            </form>
            </body></html>
          `;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: html
      };
    }
  });
}
