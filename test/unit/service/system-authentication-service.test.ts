import axios from 'axios';
import { SystemAuthenticationService } from '../../../app/service/system-authentication-service';
import * as jwtUtils from '../../../app/utils/jwt-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('system-authentication-service', () => {
  const token = 'token';
  const uuid = 'uuid';
  let authenticationService: SystemAuthenticationService;
  let sandbox: sinon.SinonSandbox;
  let axiosStub;
  let isJWTExpiredStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    authenticationService = new SystemAuthenticationService();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('returns user token and caches', async () => {
    axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve({ data: { access_token: token } }));

    const token1 = await authenticationService.getCaseworkSystemToken();
    const token2 = await authenticationService.getCaseworkSystemToken();

    expect(token1).to.be.eq(token);
    expect(token2).to.be.eq(token);
    expect(axiosStub).to.have.been.calledOnce;
  });

  it('requests new user token when cached token expires', async () => {
    axiosStub = sandbox.stub(axios, 'post').returns(Promise.resolve({ data: { access_token: token } }));
    isJWTExpiredStub = sandbox.stub(jwtUtils, 'isJWTExpired').returns(true);

    const token1 = await authenticationService.getCaseworkSystemToken();
    const token2 = await authenticationService.getCaseworkSystemToken();

    expect(token1).to.be.eq(token);
    expect(token2).to.be.eq(token);
    expect(isJWTExpiredStub).to.have.been.calledOnce;
    expect(axiosStub).to.have.been.calledTwice;
  });

  it('returns user uuid and caches', async () => {
    axiosStub = sandbox.stub(axios, 'get').returns(Promise.resolve({ data: { uid: uuid } }));

    const uuid1 = await authenticationService.getCaseworkSystemUUID(token);
    const uuid2 = await authenticationService.getCaseworkSystemUUID(token);

    expect(uuid1).to.be.eq(uuid);
    expect(uuid2).to.be.eq(uuid);
    expect(axiosStub).to.have.been.calledOnce;
  });

  it('when requesting UUID fails, returns undefined', async () => {
    axiosStub = sandbox.stub(axios, 'get').returns(Promise.reject());

    const uuid1 = await authenticationService.getCaseworkSystemUUID(token);

    expect(uuid1).to.be.eq(undefined);
  });
});
