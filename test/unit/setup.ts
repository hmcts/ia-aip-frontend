import S2SService from '../../app/service/s2s-service';
import { sinon } from '../utils/testUtils';

let sandbox: sinon.SinonSandbox;
export let buildStub: sinon.SinonStub;
export const mochaHooks = {
  beforeEach() {
    sandbox = sinon.createSandbox();

    buildStub = sandbox
      .stub(S2SService.getInstance(), 'buildRequest');

    buildStub.resolves();
  },

  afterEach() {
    sandbox.restore();
  }
};
