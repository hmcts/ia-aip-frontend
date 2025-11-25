import { Mockttp } from 'mockttp';

export async function setupCdamDeleteDocument(server: Mockttp) {
  await server.forDelete(/\/cases\/documents\/[^/]+/).thenCallback(async () => {
    return {
      status: 204,
      body: ''
    };
  });
}
