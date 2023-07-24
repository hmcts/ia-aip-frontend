import rp from 'request-promise';
import * as refDataApi from '../../../app/api/ref-data-api';
import { expect, sinon } from '../../utils/testUtils';

describe('ref-data-api', () => {
  let rpGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const headers = {
    userToken: 'aUserToken',
    serviceToken: 'aServiceToken'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    rpGetStub = sandbox.stub(rp, 'get').resolves({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call common ref data LoV endpoint', async () => {
    await refDataApi.commonRefDataLov(headers, 'InterpreterLanguage');

    expect(rpGetStub).to.have.been.called;
  });

});
