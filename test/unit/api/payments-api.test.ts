import axios from 'axios';
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
  let data;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    data = {};
    rpGetStub = sandbox.stub(axios, 'get').resolves({});
    rpPostStub = sandbox.stub(axios, 'post').resolves({ data: data });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call service request card payment endpoint', async () => {
    await paymentsApi.createCardPayment(headers, {}, 'http://aReturnUrl', 'theServiceRequestRef');

    expect(rpPostStub.called).to.equal(true);
    expect(rpPostStub.firstCall.args[0]).to.include('/service-request/theServiceRequestRef/card-payments');
    expect(rpPostStub.firstCall.args[2].headers['service-callback-url']).to.include('/service-request-update');
  });

  it('should call paymentsDetails endpoint', async () => {
    await paymentsApi.paymentDetails(headers, 'paymentRef');

    expect(rpGetStub.called).to.equal(true);
  });
});
