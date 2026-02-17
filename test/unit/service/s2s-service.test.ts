import axios from 'axios';
import S2SService from '../../../app/service/s2s-service';
import * as jwtUtils from '../../../app/utils/jwt-utils';
import { expect, sinon } from '../../utils/testUtils';

describe('s2s-service', () => {
  let sandbox: sinon.SinonSandbox;

  const requestStub = {
    uri: 'theUrl',
    body: {
      microservice: 'serviceName',
      oneTimePassword: '12345'
    }
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('checks that the same instance is returned', async () => {
    const firstInstance = S2SService.getInstance();
    const secondInstance = S2SService.getInstance();

    expect(firstInstance).to.equal(secondInstance);
  });

  it('gets serviceToken stored in memory if it is not expired', async () => {
    const s2s = S2SService.getInstance();
    s2s.setServiceToken('TheTokenInMemory');

    const stub = sandbox.stub(jwtUtils, 'isJWTExpired').callsFake(() => {
      return false;
    });

    const result = await s2s.getServiceToken();
    expect(stub.callCount).to.equal(1);
    expect(result).to.equal('Bearer TheTokenInMemory');
  });

  it('requests a new token when current token in memory is expired', async () => {
    const s2s = S2SService.getInstance();
    s2s.setServiceToken('AExpiredTokenInMemory');

    const stubResponse = { status: 200, statusText: 'OK', data:  'theNewToken' };
    const restCall = sandbox.stub(axios, 'post').withArgs(requestStub.uri, requestStub.body).returns(Promise.resolve(stubResponse));

    const jwtStub = sandbox.stub(jwtUtils, 'isJWTExpired').callsFake(() => {
      return true;
    });
    const buildStub = sandbox.stub(s2s, 'buildRequest');
    buildStub.resolves(requestStub);

    const result = await s2s.getServiceToken();
    expect(jwtStub.callCount).to.equal(1);
    expect(buildStub.callCount).to.equal(1);
    expect(restCall.callCount).to.equal(1);
    expect(result).to.equal('Bearer theNewToken');
  });
});
