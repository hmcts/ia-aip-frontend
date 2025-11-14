import request from 'request-promise-native';
import getUserDetails from '../../../../../app/middleware/ia-idam-express-middleware/wrapper/getUserDetails';
import { expect, sinon } from '../../../../utils/testUtils';

describe('getUserDetails', () => {
  const args: IdamConfig = {};
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(request, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('makes the request to obtain oauth token', () => {
    // Arrange.
    const token = 'some-token';
    args.idamApiUrl = 'some-url';
    // Act.
    getUserDetails(token, args);
    // Assert.
    expect(request.get.calledOnce).to.equal(true);
    const requestOptions = request.get.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/details`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });

  it('makes the request to obtain openId token', () => {
    // Arrange.
    const token = 'some-token';
    args.idamApiUrl = 'some-url';
    args.openId = true;
    // Act.
    getUserDetails(token, args);
    // Assert.
    expect(request.get.calledOnce).to.equal(true);
    const requestOptions = request.get.getCall(0).args.pop();
    expect(requestOptions).to.have.property('json', true);
    expect(requestOptions.uri).to.equal(`${args.idamApiUrl}/o/userinfo`);
    expect(requestOptions.headers.Authorization).to.contain(token);
  });
});
