import axios from 'axios';
import * as paymentsApi from '../../../app/api/payments-api';
import { expect, sinon } from '../../utils/testUtils';

describe('payments-api', () => {
  let axiosGetStub: sinon.SinonStub;
  let axiosPostStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const headers = {
    userToken: 'aUserToken',
    serviceToken: 'aServiceToken'
  };
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    axiosGetStub = sandbox.stub(axios, 'get').resolves({});
    axiosPostStub = sandbox.stub(axios, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call create card payment endpoint', async () => {
    await paymentsApi.createCardPayment(headers, {}, 'http://aReturnUrl');

    expect(axiosPostStub).to.have.been.called;
  });

  it('should call paymentsDetails endpoint', async () => {
    await paymentsApi.paymentDetails(headers, 'paymentRef');

    expect(axiosGetStub).to.have.been.called;
  });
});
