import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import chaiString from 'chai-string';

const expect = chai.expect;
chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(chaiString);

export {
  expect,
  sinon
};
