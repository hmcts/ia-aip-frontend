import { Request } from 'express';
import { getIdamRedirectUrl } from '../../../app/utils/url-utils';

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
});
