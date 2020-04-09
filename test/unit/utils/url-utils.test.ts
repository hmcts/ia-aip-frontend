import { Request } from 'express';
import { getIdamLoginUrl, getIdamRedirectUrl } from '../../../app/utils/url-utils';

import { expect } from '../../utils/testUtils';

describe('creates url', () => {
  it('not for localhost', () => {
    const req = {
      hostname: 'example.com'
    } as Partial<Request>;

    const redirectUrl = getIdamRedirectUrl(req as Request);

    expect(redirectUrl).eq('https://example.com/redirectUrl');
  });

  it('for localhost', () => {
    const req = {
      hostname: 'localhost'
    } as Partial<Request>;

    const redirectUrl = getIdamRedirectUrl(req as Request);

    expect(redirectUrl).eq('https://localhost:3000/redirectUrl');
  });

  it('getIdamLoginUrl for login', () => {
    const req = {
      query: {
        register: true
      }
    } as Partial<Request>;

    const loginUrl = getIdamLoginUrl(req as Request);

    expect(loginUrl).eq('IDAM_WEB_URL/users/selfRegister');
  });

  it('getIdamLoginUrl for login', () => {
    const req = {
      query: {}
    } as Partial<Request>;

    const loginUrl = getIdamLoginUrl(req as Request);

    expect(loginUrl).eq('IDAM_WEB_URL/login');
  });
});
