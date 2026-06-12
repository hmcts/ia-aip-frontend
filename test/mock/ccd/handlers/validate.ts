import { Mockttp } from 'mockttp';

export async function setupValidate(server: Mockttp) {
  await server.forPost(
    /\/citizens\/([^/]+)\/jurisdictions\/([^/]+)\/case-types\/([^/]+)\/validate/
  ).thenCallback(async () => {
    return {
      statusCode: 200
    };
  });
}
