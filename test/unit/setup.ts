import S2SService from '../../app/service/s2s-service';
import { sinon } from '../utils/testUtils';
const path = require('path');

let sandbox: sinon.SinonSandbox;
export let buildStub: sinon.SinonStub;
const EXCLUDED = path.resolve(__dirname, 'service', 's2s-service.test.ts');

export const mochaHooks = {
  beforeEach() {
    const file = path.resolve(this.currentTest.file);
    if (file === EXCLUDED) {
      return; // skip hook
    }

    sandbox = sinon.createSandbox();
    buildStub = sandbox
      .stub(S2SService.getInstance(), 'buildRequest');

    buildStub.resolves();
  },

  afterEach() {
    const file = path.resolve(this.currentTest.file);
    if (file === EXCLUDED) {
      return; // skip hook
    }
    sandbox.restore();
  }
};
