import { Mockttp } from 'mockttp';

export async function setupPcqHealth(server: Mockttp) {
  await server.forGet('/health').thenCallback(async () => {
    return {
      statusCode: 200,
      json: {
        data: { status: 'DOWN' }
      }
    };
  });
}
