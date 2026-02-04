import jwt from 'jsonwebtoken';
import { Mockttp } from 'mockttp';

export async function setupGetToken(server: Mockttp) {
  const token = jwt.sign(
    { forename: 'John', surname: 'Smith' },
    'secret',
    { expiresIn: '1h' }
  );

  await server.forPost('/oauth2/token').thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        access_token: token
      }
    };
  });
}
