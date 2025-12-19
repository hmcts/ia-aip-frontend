import { Mockttp } from 'mockttp';

export async function setupGetOToken(server: Mockttp) {
  await server.forPost('/o/token').thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        access_token: '09876'
      }
    };
  });
}
