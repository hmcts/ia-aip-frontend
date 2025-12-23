import { Mockttp } from 'mockttp';

export async function setupDeleteToken(server: Mockttp) {
  await server.forDelete(/\/session\/[^/]+/).always().thenCallback(async () => {
    return {
      statusCode: 204,
      body: ''
    };
  });
}
