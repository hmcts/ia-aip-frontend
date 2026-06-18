import { diff } from 'deep-diff';
import S2SService from '../../app/service/s2s-service';
import { expect, sinon } from '../utils/testUtils';
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

function expectRenderedCalledWithArgs(
  resRenderStub: sinon.SinonStub,
  templatePath: string,
  expectedViewModel: any
) {
  try {
    expect(resRenderStub).calledOnceWith(templatePath, expectedViewModel);
  } catch (error) {
    expect(resRenderStub.calledOnce).to.equal(true);

    const [template, actualViewModel] = resRenderStub.firstCall.args;

    expect(template).to.equal(templatePath);
    expect(actualViewModel).to.deep.equal(expectedViewModel);
  }
}

function expectRenderedCalledOnceWithArgs(
  resRenderStub: sinon.SinonStub,
  templatePath: string,
  expectedViewModel: any
) {
  try {
    expect(resRenderStub).calledWith(templatePath, expectedViewModel);
  } catch (error) {
    expect(resRenderStub.called).to.equal(true);

    const [template, actualViewModel] = resRenderStub.firstCall.args;

    expect(template).to.equal(templatePath);
    expect(actualViewModel).to.deep.equal(expectedViewModel);
  }
}

(global as any).expectRenderedCalledOnceWithArgs = expectRenderedCalledOnceWithArgs;
(global as any).expectRenderedCalledWithArgs = expectRenderedCalledWithArgs;
