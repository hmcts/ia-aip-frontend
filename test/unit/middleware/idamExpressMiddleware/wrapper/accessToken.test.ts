import axios from 'axios';
import accessToken from '../../../../../app/middleware/ia-idam-express-middleware/wrapper/accessToken';
import { expect, sinon } from '../../../../utils/testUtils';

describe('accessToken', () => {
  const args: IdamConfig = {};
  let sandbox: sinon.SinonSandbox;
  let postStub: sinon.SinonStub;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    postStub = sandbox.stub(axios, 'post');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('makes the request to obtain oauth token', async () => {
    // Arrange.
    const options = { field: 'value' };
    args.idamApiUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.idamSecret = 'some-secret';
    postStub.resolves({ data: {} });
    // Act.
    await accessToken(options, args);
    // Assert.
    expect(postStub).to.be.calledOnce;
    const [uri, body, requestOptions] = postStub.getCall(0).args;
    expect(uri).to.equal(`${args.idamApiUrl}/oauth2/token`);
    expect(body).to.include('field=value');
    expect(body).to.include('grant_type=authorization_code');
    expect(requestOptions).to.have.nested.property('auth.username', args.idamClientID);
    expect(requestOptions).to.have.nested.property('auth.password', args.idamSecret);
    expect(requestOptions.headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded');
  });

  it('makes the request to obtain openId token', async () => {
    // Arrange.
    const options = { field: 'value' };
    args.idamApiUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.idamSecret = 'some-secret';
    args.openId = true;
    // Act.
    postStub.resolves({ data: {} });
    await accessToken(options, args);
    // Assert.
    expect(postStub).to.be.calledOnce;
    const [uri, body, requestOptions] = postStub.getCall(0).args;
    expect(uri).to.equal(`${args.idamApiUrl}/o/token`);
    expect(body).to.include('field=value');
    expect(body).to.include('client_id=some-id');
    expect(body).to.include('client_secret=some-secret');
    expect(body).to.include('grant_type=authorization_code');
    expect(requestOptions.headers).to.have.property('Content-Type', 'application/x-www-form-urlencoded');
  });
});
