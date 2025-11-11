import url from 'url';
import loginUrl from '../../../../../app/middleware/ia-idam-express-middleware/wrapper/loginUrl';
import { IdamConfig } from '../../../../../types';
import { expect, sinon } from '../../../../utils/testUtils';

describe('loginUrl', () => {
  const args: IdamConfig = {};
  let sandbox: sinon.SinonSandbox;
  let urlFormatSpy: sinon.SinonSpy;
  beforeEach(() => {
    sandbox = sinon.createSandbox();
    urlFormatSpy = sandbox.spy(url, 'format');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('makes the request to obtain token', () => {
    // Arrange.
    const options = { foo: 'bar' };
    args.idamLoginUrl = 'some-url';
    args.idamClientID = 'some-id';
    args.redirectUri = 'some-uri';
    // Act.
    const output = loginUrl(options, args);
    // Assert.
    expect(url.format).to.have.been.called.calledOnce;
    const formatArgs = urlFormatSpy.getCall(0).args.pop();
    expect(formatArgs).to.have.property('query');
    expect(output).to.contain(Object.keys(options).pop());
  });
});
