// test/unit/testHelper.d.ts

import sinon from 'sinon';

declare global {
  function expectRenderedCalledWithArgs(
    resRenderStub: sinon.SinonStub,
    templatePath: string,
    expectedViewModel: any
  ): void;
}

export {};
