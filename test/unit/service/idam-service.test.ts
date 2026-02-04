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
});
