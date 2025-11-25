import cache from 'memory-cache';
import { Mockttp } from 'mockttp';

export async function setupSetupCase(server: Mockttp) {
  await server.forPost('/setupCase').thenCallback(async (request) => {
    const body = await request.body.getJson();
    cache.put('caseData', body);
    return {
      status: 200,
      json: body
    };
  });
}
