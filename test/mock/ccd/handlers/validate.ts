import { Mockttp } from 'mockttp';

export async function setupValidate(server: Mockttp) {
  await server.forPost(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/validate/
  ).thenCallback(async (request) => {
    const match = request.url
      .match(/\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/validate/);
    const uid = match ? match[1] : 'some-uid';
    return {
      statusCode: uid === '55' ? 400 : 200
    };
  });
}
