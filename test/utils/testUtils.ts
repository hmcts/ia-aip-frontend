import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';
import chaiUuid from 'chai-uuid';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

const expect = chai.expect;
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiString);
chai.use(chaiUuid);

export {
  expect,
  sinon
};
