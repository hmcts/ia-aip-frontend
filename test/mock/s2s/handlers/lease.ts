import { Mockttp } from 'mockttp';

export async function setupLease(server: Mockttp) {
  await server.forDelete('/lease').thenCallback(async () => {
    return {
      status: 200,
      json: {
        data: 'someS2SToken'
      }
    };
  });
}
