import axios from 'axios';
import getUserDetails from '../../../../../app/middleware/ia-idam-express-middleware/wrapper/getUserDetails';
import { expect, sinon } from '../../../../utils/testUtils';

describe('getUserDetails', () => {
  const args: IdamConfig = {};
  let sandbox: sinon.SinonSandbox;
  let getStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    getStub = sandbox.stub(axios, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('makes the request to obtain oauth token', async () => {
    const token = 'some-token';
    args.idamApiUrl = 'some-url';

    getStub.resolves({ data: {} });
    await getUserDetails(token, args);

    expect(getStub).to.be.calledOnce;
    const [url, requestOptions] = getStub.getCall(0).args;
    expect(url).to.equal(`${args.idamApiUrl}/details`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });

  it('makes the request to obtain openId token', async () => {
    const token = 'some-token';
    args.idamApiUrl = 'some-url';
    args.openId = true;

    getStub.resolves({ data: {} });
    await getUserDetails(token, args);

    expect(getStub).to.be.calledOnce;
    const [url, requestOptions] = getStub.getCall(0).args;
    expect(url).to.equal(`${args.idamApiUrl}/o/userinfo`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });
});
