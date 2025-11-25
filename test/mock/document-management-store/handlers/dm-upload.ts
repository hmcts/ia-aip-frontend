import { Mockttp } from 'mockttp';
import { documentForHandler } from './cdam-upload';

export async function setupDmUpload(server: Mockttp) {
  await server.forPost('/documents').thenCallback(async () => {
    return {
      status: 200,
      json: {
        _embedded: {
          documents: [
            documentForHandler
          ]
        }
      }
    };
  });
}
