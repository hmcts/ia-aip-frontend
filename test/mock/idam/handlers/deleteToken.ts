import { Mockttp } from 'mockttp';

export async function setupDeleteToken(server: Mockttp) {
  await server.forDelete(/\/session\/[^/]+/).thenCallback(async () => {
    return {
      status: 204,
      body: ''
    };
  });
}
