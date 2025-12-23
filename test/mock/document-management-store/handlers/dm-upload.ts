import { Mockttp } from 'mockttp';
import { documentForHandler } from './cdam-upload';

export async function setupDmUpload(server: Mockttp) {
  await server.forPost('/documents').always().thenCallback(async () => {
    return {
      statusCode: 200,
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
