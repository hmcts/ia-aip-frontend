import { Mockttp } from 'mockttp';

export async function setupLease(server: Mockttp) {
  await server.forPost('/lease').always().thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        data: 'someS2SToken'
      }
    };
  });
}
