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
  return {
    key: key,
    text: `"${key}" is required`,
    href: `#${key}`
  };
}

export {
  expect,
  sinon,
  validateUuid,
  buildExpectedRequiredError
};
