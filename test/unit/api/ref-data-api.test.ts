import axios from 'axios';
import * as refDataApi from '../../../app/api/ref-data-api';
import { expect, sinon } from '../../utils/testUtils';

describe('ref-data-api', () => {
  let axiosGetStub: sinon.SinonStub;
  let sandbox: sinon.SinonSandbox;
  const headers = {
    userToken: 'aUserToken',
    serviceToken: 'aServiceToken'
  };

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    axiosGetStub = sandbox.stub(axios, 'get').resolves({});
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call common ref data LoV endpoint', async () => {
    await refDataApi.commonRefDataLov(headers, 'InterpreterLanguage');

    expect(axiosGetStub).to.have.been.called;
  });
});
