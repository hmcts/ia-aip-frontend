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

function createQueryMock(suffix: string, hasParentId?: boolean, parentId?: string, createdByCitizen?: boolean, futureDate?: boolean, isClosed?: boolean) {
  const date = new Date(2026, 1, 1).toISOString();
  const future = new Date(2030, 2, 2).toISOString();

  return {
    id: 'someId' + suffix,
    subject: 'someSubject' + suffix,
    createdBy: createdByCitizen ? 'citizenIdamUid' : 'otherIdamUid',
    createdOn: futureDate ? future : date,
    messageType: 'NewQuery' as CcdQmQueryMessageType,
    parentId: hasParentId ? parentId : undefined,
    isClosed: isClosed ? 'Yes' : 'No' as 'Yes' | 'No'
  };
}

export {
  expect,
  sinon,
  validateUuid,
  buildExpectedRequiredError,
  makeFileMock,
  buildExpectedError,
  setActiveNlr,
  createQueryMock
};
