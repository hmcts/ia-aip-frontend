import { Request } from 'express';
import IdamService from '../../../app/service/idam-service';
import { expect } from '../../utils/testUtils';

describe('idam-service', () => {
  it('checks the user token is retrieved from the __auth-token cookie', async () => {
    const authToken = 'authToken';
    const userToken = new IdamService().getUserToken({
      cookies: {
        '__auth-token': authToken
      }
    } as Request);

    expect(userToken).eq(`Bearer ${authToken}`);
  });

  it('checks the _oauth2_proxy token is retrieved from the _oauth2_proxy cookie', async () => {
    const authToken = 'oauth2Token';
    const userToken = new IdamService().getOath2ProxyToken({
      cookies: {
        '_oauth2_proxy': authToken
      }
    } as Request);

    expect(userToken).eq(`Bearer ${authToken}`);
  });
});
