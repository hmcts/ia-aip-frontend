import { ready } from '../../../client/main';
import { expect, sinon } from '../../utils/testUtils';

describe('', () => {
  let sandbox: sinon.SinonSandbox;
  let callbackStub: sinon.SinonStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbackStub = sandbox.stub();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should call the callback', () => {
    ready(callbackStub);
    expect(callbackStub).to.have.been.calledOnce;
  });
});
