import rp from 'request-promise';
import * as paymentsApi from '../../../app/api/payments-api';
import { expect, sinon } from '../../utils/testUtils';

describe('payments-api', () => {
  let rpGetStub: sinon.SinonStub;
  let rpPostStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const headers = {
    userToken: 'aUserToken',
    serviceToken: 'aServiceToken'
  };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rpGetStub = sandbox.stub(rp, 'get').resolves({});
    rpPostStub = sandbox.stub(rp, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call create card payment endpoint', async () => {
    await paymentsApi.createCardPayment(headers, {}, 'http://aReturnUrl');

    expect(rpPostStub).to.have.been.called;
  });

  it('should call paymentsDetails endpoint', async () => {
    await paymentsApi.paymentDetails(headers, 'paymentRef');

    expect(rpGetStub).to.have.been.called;
  });
});
