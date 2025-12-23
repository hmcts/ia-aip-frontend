import { Mockttp } from 'mockttp';

export async function setupCdamDeleteDocument(server: Mockttp) {
  await server.forDelete(/\/cases\/documents\/[^/]+/).thenCallback(async () => {
    return {
      statusCode: 204,
      body: ''
    };
  });
}
