import { Mockttp } from 'mockttp';

export async function setupDmDeleteDocument(server: Mockttp) {
  await server.forDelete(/\/documents\/[^/]+/).thenCallback(async () => {
    return {
      status: 204,
      body: ''
    };
  });
}
