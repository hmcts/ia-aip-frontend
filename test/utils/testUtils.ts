import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
const validateUuid = require('uuid-validate');

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);

const expect = chai.expect;

function buildExpectedRequiredError(key: string) {
  return buildExpectedError(key, `"${key}" is required`);
}

function buildExpectedError(key: string, errorMessage: string) {
  return {
    key: key,
    text: errorMessage,
    href: `#${key}`
  };
}

function setActiveNlr(req: any) {
  req.session = {
    ...req.session,
    appeal: {
      ...req.session.appeal,
      application: {
        ...req.session.appeal.application,
        hasNonLegalRep: 'Yes'
      },
      nlrDetails: {
        ...req.session.appeal.nlrDetails,
        idamId: 'someId'
      }
    }
  };
}

function makeFileMock(suffix: string) {
  return {
    id: `${suffix}File`,
    fieldname: `file${suffix}`,
    originalname: `file${suffix}.pdf`,
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 4,
    buffer: Buffer.from(`test${suffix}`),
    stream: {} as any,
    destination: '',
    filename: '',
    path: ''
  };
}

export {
  expect,
  sinon,
  validateUuid,
  buildExpectedRequiredError,
  makeFileMock,
  buildExpectedError,
  setActiveNlr
};
