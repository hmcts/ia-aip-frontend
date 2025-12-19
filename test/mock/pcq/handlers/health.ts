import { Mockttp } from 'mockttp';

export async function setupPcqHealth(server: Mockttp) {
  await server.forGet('/health').thenCallback(async () => {
    return {
      status: 200,
      json: {
        data: { status: 'DOWN' }
      }
    };
  });
}
