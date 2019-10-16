import AppealTypes from '../../../app/domain/appeal-types';
import { expect, sinon } from '../../utils/testUtils';

describe('Type of appeal Object', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('When creating an object should create an object with all values', () => {
    const appealTypes = new AppealTypes();
    expect(appealTypes).to.be.an('array');
    expect(appealTypes).to.have.lengthOf(5);
    expect(appealTypes[0]).to.have.keys([ 'id', 'name', 'description', 'example' ]);
    expect(appealTypes[0].example).to.be.an('Object');
    expect(appealTypes[0].example).to.have.keys([ 'id', 'name', 'description' ]);
    expect(appealTypes[0].id).to.eq('protection');
    expect(appealTypes[0].name).to.eq('Protection');
    expect(appealTypes[0].example.id).to.eq('protection-example');

  });

});
